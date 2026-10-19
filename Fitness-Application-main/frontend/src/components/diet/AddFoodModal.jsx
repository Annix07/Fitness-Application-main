import { useState, useEffect, useMemo, useRef } from 'react';
import { RECIPES_DATABASE, scaleRecipeNutrients } from '../../data/recipesDatabase';
import { IconUtensils } from '../common/Icons';
import '../../styles/AddFoodModal.css';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

export default function AddFoodModal({
  isOpen,
  onClose,
  onSave,
  editItem = null,
  defaultMealType = 'breakfast',
}) {
  const [mealType, setMealType] = useState(defaultMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editServings, setEditServings] = useState(1);
  const [addedItems, setAddedItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize on open or editItem change
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setMealType(editItem.mealType || defaultMealType);
        const recId = editItem.recipeId || editItem.food?.id;
        const matching = RECIPES_DATABASE.find((r) => r.id === recId) || {
          id: editItem.food?.id || `custom-${Date.now()}`,
          name: editItem.food?.name || 'Meal Item',
          calories: editItem.calories || 0,
          protein: editItem.protein || 0,
          carbs: editItem.carbs || 0,
          fat: editItem.fat || 0,
          fiber: editItem.fiber || 0,
          servings: 1,
        };
        setSelectedRecipe(matching);
        setSearchQuery(matching.name);
        setEditServings(editItem.quantity || 1);
        setAddedItems([]);
      } else {
        setMealType(defaultMealType);
        setSelectedRecipe(null);
        setSearchQuery('');
        setEditServings(1);
        setAddedItems([]);
        setHighlightedIndex(0);
      }
      setIsDropdownOpen(false);
      setErrorMsg('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, editItem, defaultMealType]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter recipes based on query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return RECIPES_DATABASE;
    const q = searchQuery.toLowerCase();
    return RECIPES_DATABASE.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.mealType?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Reset highlight index on filter change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Auto scroll dropdown to highlighted item
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const activeEl = dropdownRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isDropdownOpen]);

  // Current selected item scaled nutrients (used in edit mode)
  const currentEditNutrients = useMemo(() => {
    if (!selectedRecipe) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    return scaleRecipeNutrients(selectedRecipe, editServings);
  }, [selectedRecipe, editServings]);

  // Calculate live combined breakdown from all added items (or edit item)
  const breakdown = useMemo(() => {
    if (editItem && selectedRecipe) {
      return {
        calories: Math.round(currentEditNutrients.calories),
        protein: parseFloat(currentEditNutrients.protein.toFixed(1)),
        carbs: parseFloat(currentEditNutrients.carbs.toFixed(1)),
        fat: parseFloat(currentEditNutrients.fat.toFixed(1)),
      };
    }

    const total = addedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      calories: Math.round(total.calories),
      protein: parseFloat(total.protein.toFixed(1)),
      carbs: parseFloat(total.carbs.toFixed(1)),
      fat: parseFloat(total.fat.toFixed(1)),
    };
  }, [addedItems, editItem, selectedRecipe, currentEditNutrients]);

  // Handle recipe selection: adds to list immediately and closes dropdown
  const handleSelectRecipe = (recipe) => {
    if (editItem) {
      setSelectedRecipe(recipe);
      setSearchQuery(recipe.name);
      setIsDropdownOpen(false);
      setErrorMsg('');
      return;
    }

    const defaultServings = 1;
    const nutrients = scaleRecipeNutrients(recipe, defaultServings);
    const newItem = {
      id: `log-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mealType,
      isRecipe: true,
      recipeId: recipe.id,
      name: recipe.name,
      food: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category || 'Recipe',
        unit: 'serving',
        servingSize: defaultServings,
      },
      quantity: defaultServings,
      unit: 'serving',
      calories: nutrients.calories,
      protein: nutrients.protein,
      carbs: nutrients.carbs,
      fat: nutrients.fat,
      fiber: nutrients.fiber,
      baseNutrients: { ...nutrients },
      rawRecipe: recipe,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAddedItems((prev) => [...prev, newItem]);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setErrorMsg('');
  };

  // Adjust servings directly in added items list
  const handleUpdateItemServings = (index, delta) => {
    setAddedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.max(0.5, Math.min(6, parseFloat((item.quantity + delta).toFixed(1))));
        const updatedNutrients = item.rawRecipe
          ? scaleRecipeNutrients(item.rawRecipe, newQty)
          : {
              calories: Math.round((item.baseNutrients.calories * newQty) / 1),
              protein: parseFloat(((item.baseNutrients.protein * newQty) / 1).toFixed(1)),
              carbs: parseFloat(((item.baseNutrients.carbs * newQty) / 1).toFixed(1)),
              fat: parseFloat(((item.baseNutrients.fat * newQty) / 1).toFixed(1)),
            };

        return {
          ...item,
          quantity: newQty,
          calories: updatedNutrients.calories,
          protein: updatedNutrients.protein,
          carbs: updatedNutrients.carbs,
          fat: updatedNutrients.fat,
        };
      })
    );
  };

  // Remove an item from added list
  const handleRemoveItem = (index) => {
    setAddedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsDropdownOpen(true);
        return;
      }
    }

    if (isDropdownOpen && filteredRecipes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredRecipes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredRecipes.length) % filteredRecipes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredRecipes[highlightedIndex];
        if (item) {
          handleSelectRecipe(item);
        }
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
  };

  // Final Submit
  const handleSubmit = () => {
    if (editItem) {
      if (!selectedRecipe) {
        setErrorMsg('Please select a food item.');
        return;
      }
      const updated = {
        id: editItem.id,
        mealType,
        isRecipe: true,
        recipeId: selectedRecipe.id,
        food: {
          id: selectedRecipe.id,
          name: selectedRecipe.name,
          category: selectedRecipe.category || 'Recipe',
          unit: 'serving',
          servingSize: editServings,
        },
        quantity: editServings,
        unit: 'serving',
        calories: currentEditNutrients.calories,
        protein: currentEditNutrients.protein,
        carbs: currentEditNutrients.carbs,
        fat: currentEditNutrients.fat,
        fiber: currentEditNutrients.fiber,
        timestamp: editItem.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSave(updated);
      onClose();
      return;
    }

    if (addedItems.length === 0) {
      setErrorMsg('Please select at least one food meal to log.');
      return;
    }

    onSave(addedItems);
    onClose();
  };

  const totalCount = editItem ? (selectedRecipe ? 1 : 0) : addedItems.length;

  if (!isOpen) return null;

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div
        className="simple-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="simple-modal-header">
          <h2>{editItem ? 'Edit Meal' : 'Add Food Meal'}</h2>
          <button
            type="button"
            className="simple-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="simple-modal-content">
          {/* 1. Target Meal Section */}
          <div className="simple-field-group">
            <label className="simple-label">Target Meal Section</label>
            <div className="simple-meal-pills">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`simple-meal-pill ${mealType === m.id ? 'active' : ''}`}
                  onClick={() => setMealType(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Food Dropdown with Keyboard Control */}
          <div className="simple-field-group" ref={containerRef}>
            <label className="simple-label">
              {editItem ? 'Selected Food' : 'Click to select food from recipes'}
            </label>
            <div className="simple-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="simple-food-input"
                placeholder={addedItems.length > 0 ? "+ Select another food meal..." : "Click to select or type to search..."}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="simple-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                    inputRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Options (Selecting an option immediately adds it to list & closes dropdown) */}
            {isDropdownOpen && (
              <div className="simple-dropdown-menu" ref={dropdownRef}>
                {filteredRecipes.map((r, i) => (
                  <div
                    key={r.id}
                    className={`simple-dropdown-option ${i === highlightedIndex ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => handleSelectRecipe(r)}
                  >
                    <span className="simple-opt-name">{r.name}</span>
                    <span className="simple-opt-cals">{r.calories} kcal</span>
                  </div>
                ))}
                {filteredRecipes.length === 0 && (
                  <div className="simple-dropdown-empty">No recipes found</div>
                )}
              </div>
            )}
          </div>

          {/* Edit Mode Servings Adjuster */}
          {editItem && selectedRecipe && (
            <div className="simple-selected-row">
              <span className="simple-servings-text">{selectedRecipe.name}</span>
              <div className="simple-servings-wrap">
                <span className="simple-servings-text">Servings:</span>
                <button
                  type="button"
                  className="simple-btn-step"
                  onClick={() => setEditServings((prev) => Math.max(0.5, prev - 0.5))}
                  disabled={editServings <= 0.5}
                >
                  –
                </button>
                <span className="simple-servings-val">{editServings}x</span>
                <button
                  type="button"
                  className="simple-btn-step"
                  onClick={() => setEditServings((prev) => Math.min(6, prev + 0.5))}
                  disabled={editServings >= 6}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Added Multiple Foods List with Inline Servings Stepper */}
          {!editItem && addedItems.length > 0 && (
            <div className="simple-added-list">
              <span className="simple-added-title">Added Foods ({addedItems.length})</span>
              {addedItems.map((item, idx) => (
                <div className="simple-added-row" key={item.id || idx}>
                  <div className="simple-added-info">
                    <span className="simple-added-name">{item.name}</span>
                    <span className="simple-added-meta">
                      {item.calories} kcal · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                    </span>
                  </div>

                  <div className="simple-added-actions">
                    <div className="simple-servings-wrap">
                      <button
                        type="button"
                        className="simple-btn-step"
                        onClick={() => handleUpdateItemServings(idx, -0.5)}
                        disabled={item.quantity <= 0.5}
                      >
                        –
                      </button>
                      <span className="simple-servings-val">{item.quantity}x</span>
                      <button
                        type="button"
                        className="simple-btn-step"
                        onClick={() => handleUpdateItemServings(idx, 0.5)}
                        disabled={item.quantity >= 6}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="simple-btn-del"
                      onClick={() => handleRemoveItem(idx)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMsg && <div className="simple-error-msg">{errorMsg}</div>}

          {/* 3. Nutritional Breakdown */}
          <div className="simple-breakdown-box">
            <div className="simple-breakdown-title">
              <IconUtensils size={14} color="#0284c7" />
              <span>Nutritional Breakdown</span>
              {totalCount > 0 && (
                <span className="simple-breakdown-count">({totalCount} {totalCount === 1 ? 'item' : 'items'})</span>
              )}
            </div>

            <div className="simple-breakdown-grid">
              <div className="simple-stat-box highlight">
                <span className="stat-val">{breakdown.calories}</span>
                <span className="stat-lbl">Calories (kcal)</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">{breakdown.protein}g</span>
                <span className="stat-lbl">Protein</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">{breakdown.carbs}g</span>
                <span className="stat-lbl">Carbs</span>
              </div>
              <div className="simple-stat-box">
                <span className="stat-val">{breakdown.fat}g</span>
                <span className="stat-lbl">Fat</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Buttons */}
        <div className="simple-modal-footer">
          <button
            type="button"
            className="simple-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="simple-btn-submit"
            onClick={handleSubmit}
            disabled={totalCount === 0}
          >
            {editItem
              ? `Update Meal (${breakdown.calories} kcal)`
              : totalCount > 1
              ? `Log ${totalCount} Meals (${breakdown.calories} kcal)`
              : `Log Meal (${breakdown.calories} kcal)`}
          </button>
        </div>
      </div>
    </div>
  );
}
