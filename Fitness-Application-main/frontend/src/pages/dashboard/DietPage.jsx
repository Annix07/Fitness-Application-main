import { useState, useMemo, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import AddFoodModal from '../../components/diet/AddFoodModal';
import RecipeDetailModal from '../../components/diet/RecipeDetailModal';
import DeleteConfirmModal from '../../components/diet/DeleteConfirmModal';
import api from '../../services/api';
import {
  IconUtensils,
  IconEdit,
  IconTrash,
  IconPlus,
  IconFoodCategory,
  IconChefHat,
  IconClock,
  IconSearch,
  IconSparkles,
} from '../../components/common/Icons';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import { RECIPES_DATABASE } from '../../data/recipesDatabase';
import { useHealthProfile } from '../../context/HealthProfileContext';
import '../../styles/DietPage.css';

// Helper to get date string YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const MEAL_CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast', desc: 'First meal of the day' },
  { id: 'lunch', name: 'Lunch', desc: 'Midday meal' },
  { id: 'dinner', name: 'Dinner', desc: 'Evening meal' },
  { id: 'snacks', name: 'Snacks & Extras', desc: 'Bites and energy snacks' },
];

const RECIPE_CATEGORIES = [
  'All',
  'High Protein',
  'Low Carb',
  'Bulking',
  'Balanced',
  'Plant-Based',
  'Quick & Easy',
];

export default function DietPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'recipes'
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [logsByDate, setLogsByDate] = useState({});

  // Sync logs with MySQL backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/diet/logs?date=${selectedDate}`);
        if (res.success) {
          setLogsByDate((prev) => ({
            ...prev,
            [selectedDate]: res.logs || [],
          }));
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };
    fetchLogs();
  }, [selectedDate]);

  // Recipe Explorer State
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState('All');
  const [recipeMealTypeFilter, setRecipeMealTypeFilter] = useState('all');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // Synchronized Health Profile Targets
  const { assessmentResults } = useHealthProfile();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Current active date logs
  const currentLogs = useMemo(() => logsByDate[selectedDate] || [], [logsByDate, selectedDate]);

  // Date Navigation Helpers
  const handleDateChange = (offset) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleJumpToToday = () => {
    setSelectedDate(getTodayStr());
  };

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDate === getTodayStr();

  // Nutritional Totals for selected date
  const totalCalories = currentLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = parseFloat(currentLogs.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(1));
  const totalCarbs = parseFloat(currentLogs.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(1));
  const totalFat = parseFloat(currentLogs.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(1));

  // Dynamic Targets from Health Assessment
  const targetCalories = assessmentResults?.targetCalories || 2250;
  const targetProtein = assessmentResults?.macros?.protein?.grams || 170;
  const targetCarbs = assessmentResults?.macros?.carbs?.grams || 240;
  const targetFat = assessmentResults?.macros?.fat?.grams || 65;

  const remainingCalories = targetCalories - totalCalories;
  const caloriePct = Math.min(Math.round((totalCalories / targetCalories) * 100), 100);
  const proteinPct = Math.min(Math.round((totalProtein / targetProtein) * 100), 100);
  const carbsPct = Math.min(Math.round((totalCarbs / targetCarbs) * 100), 100);
  const fatPct = Math.min(Math.round((totalFat / targetFat) * 100), 100);

  // Group meals by category
  const mealsByCategory = useMemo(() => {
    const map = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    currentLogs.forEach((item) => {
      const type = (item.mealType || 'breakfast').toLowerCase();
      if (map[type]) {
        map[type].push(item);
      } else {
        map.snacks.push(item);
      }
    });

    return map;
  }, [currentLogs]);

  // Recipe filtering
  const filteredRecipes = useMemo(() => {
    return RECIPES_DATABASE.filter((recipe) => {
      const matchCat =
        recipeCategoryFilter === 'All' || recipe.category === recipeCategoryFilter;
      const matchMeal =
        recipeMealTypeFilter === 'all' || recipe.mealType === recipeMealTypeFilter;
      const matchSearch =
        !recipeSearch.trim() ||
        recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        recipe.subtitle.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        recipe.tags?.some((t) => t.toLowerCase().includes(recipeSearch.toLowerCase())) ||
        recipe.ingredients?.some((ing) => ing.name.toLowerCase().includes(recipeSearch.toLowerCase()));

      return matchCat && matchMeal && matchSearch;
    });
  }, [recipeCategoryFilter, recipeMealTypeFilter, recipeSearch]);

  // Modal Handlers
  const handleOpenAddModal = (mealType = 'breakfast') => {
    setEditItem(null);
    setActiveMealType(mealType);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItem(item);
    setActiveMealType(item.mealType || 'breakfast');
    setModalOpen(true);
  };

  const handleSaveFood = async (itemOrItems) => {
    const itemsToAdd = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

    setLogsByDate((prev) => {
      const existing = prev[selectedDate] || [];
      if (editItem) {
        return {
          ...prev,
          [selectedDate]: existing.map((item) => (item.id === editItem.id ? itemsToAdd[0] : item)),
        };
      }
      return {
        ...prev,
        [selectedDate]: [...existing, ...itemsToAdd],
      };
    });

    for (const item of itemsToAdd) {
      try {
        await api.post('/diet/logs', {
          date: selectedDate,
          ...item,
        });
      } catch {}
    }
  };

  const handleLogRecipeDirect = async (recipe, mealTypeChoice = 'lunch') => {
    const logItem = {
      id: `log-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mealType: mealTypeChoice,
      isRecipe: true,
      recipeId: recipe.id,
      food: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category || 'Recipe',
        unit: 'serving',
        servingSize: 1,
      },
      quantity: 1,
      unit: 'serving',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLogsByDate((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), logItem],
    }));

    setActiveTab('tracker');

    try {
      await api.post('/diet/logs', {
        date: selectedDate,
        ...logItem,
      });
    } catch {}
  };

  const handleLogRecipeFromModal = async (logItem, targetDate = selectedDate) => {
    const dateToUse = targetDate || selectedDate;
    setLogsByDate((prev) => ({
      ...prev,
      [dateToUse]: [...(prev[dateToUse] || []), logItem],
    }));
    setActiveTab('tracker');

    try {
      await api.post('/diet/logs', {
        date: dateToUse,
        ...logItem,
      });
    } catch {}
  };

  const handlePromptDelete = (item) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    setLogsByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((item) => item.id !== id),
    }));

    try {
      await api.delete(`/diet/logs/${id}`);
    } catch {}
  };

  return (
    <div className="diet-page-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="diet-content">
        {/* Top Header */}
        <header className="diet-header">
          <div className="diet-header-left">
            <h1>Diet &amp; Nutrition Tracker</h1>
            <p>Track your daily meals, macros, and calorie targets</p>
          </div>

          <div className="diet-header-actions">
            {/* Date Navigator */}
            <div className="date-navigator">
              <button
                type="button"
                className="date-nav-btn"
                onClick={() => handleDateChange(-1)}
                title="Previous Day"
                aria-label="Previous Day"
              >
                ‹
              </button>

              <input
                type="date"
                className="date-picker-field"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch {
                    /* fallback */
                  }
                }}
                title="Select date"
                aria-label="Select Date"
              />

              <button
                type="button"
                className="date-nav-btn"
                onClick={() => handleDateChange(1)}
                title="Next Day"
                aria-label="Next Day"
              >
                ›
              </button>

              {!isToday && (
                <button
                  type="button"
                  className="btn-today-quick"
                  onClick={handleJumpToToday}
                >
                  Today
                </button>
              )}
            </div>

            {/* Global Add Food Button */}
            <button
              type="button"
              className="btn-add-food-global"
              onClick={() => handleOpenAddModal('breakfast')}
            >
              <IconPlus size={16} />
              <span>Add Food</span>
            </button>
          </div>
        </header>

        {/* View Switcher Tabs */}
        <div className="diet-tab-bar">
          <button
            type="button"
            className={`diet-tab-pill ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <IconUtensils size={16} />
            <span>Daily Log</span>
          </button>
          <button
            type="button"
            className={`diet-tab-pill ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <IconChefHat size={16} />
            <span>Recipes &amp; Ideas</span>
          </button>
        </div>

        {/* TAB 1: CLEAN DAILY LOG ORGANIZED BY MEAL                */}
        {activeTab === 'tracker' && (
          <div className="tracker-view-wrap">
            <section className="diet-macro-card">
              <div className="macro-card-header">
                <div>
                  <span className="macro-card-title">Daily Summary</span>
                  <span className="macro-card-date">· {formattedDate}</span>
                </div>
                <div className="macro-card-budget">
                  {remainingCalories >= 0 ? (
                    <span className="budget-tag positive">
                      <strong>{remainingCalories}</strong> kcal remaining
                    </span>
                  ) : (
                    <span className="budget-tag over">
                      <strong>+{Math.abs(remainingCalories)}</strong> kcal over goal
                    </span>
                  )}
                </div>
              </div>

              {/* Main Calories Bar */}
              <div className="calorie-strip">
                <div className="calorie-strip-labels">
                  <span className="calorie-consumed-val">
                    <strong>{totalCalories}</strong> / {targetCalories} kcal
                  </span>
                  <span className="calorie-pct-val">{caloriePct}% of daily target</span>
                </div>
                <div className="calorie-bar-track">
                  <div
                    className="calorie-bar-fill"
                    style={{
                      width: `${caloriePct}%`,
                      backgroundColor: remainingCalories >= 0 ? '#0284c7' : '#ea580c',
                    }}
                  />
                </div>
              </div>

              {/* 3 Simple Macro Metric Cards */}
              <div className="macro-grid">
                {/* Protein */}
                <div className="macro-item">
                  <div className="macro-item-header">
                    <span className="macro-name">Protein</span>
                    <span className="macro-numbers">
                      <strong>{totalProtein}g</strong> / {targetProtein}g
                    </span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill protein"
                      style={{ width: `${proteinPct}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="macro-item">
                  <div className="macro-item-header">
                    <span className="macro-name">Carbs</span>
                    <span className="macro-numbers">
                      <strong>{totalCarbs}g</strong> / {targetCarbs}g
                    </span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill carbs"
                      style={{ width: `${carbsPct}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div className="macro-item">
                  <div className="macro-item-header">
                    <span className="macro-name">Fat</span>
                    <span className="macro-numbers">
                      <strong>{totalFat}g</strong> / {targetFat}g
                    </span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill fat"
                      style={{ width: `${fatPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Meal Sections: Breakfast, Lunch, Dinner, Snacks */}
            <div className="meals-sections-list">
              {MEAL_CATEGORIES.map((cat) => {
                const items = mealsByCategory[cat.id] || [];
                const mealCals = items.reduce((sum, it) => sum + (it.calories || 0), 0);
                const mealProtein = items.reduce((sum, it) => sum + (it.protein || 0), 0).toFixed(1);
                const mealCarbs = items.reduce((sum, it) => sum + (it.carbs || 0), 0).toFixed(1);
                const mealFat = items.reduce((sum, it) => sum + (it.fat || 0), 0).toFixed(1);

                return (
                  <section className="meal-category-card" key={cat.id}>
                    {/* Meal Header with Calories and + Add Button */}
                    <div className="meal-card-header">
                      <div className="meal-header-info">
                        <h2 className="meal-title">{cat.name}</h2>
                        <span className="meal-cals-total">
                          {mealCals > 0 ? `${mealCals} kcal` : '0 kcal'}
                        </span>
                        {mealCals > 0 && (
                          <span className="meal-macros-sub">
                            (P: {mealProtein}g · C: {mealCarbs}g · F: {mealFat}g)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-meal-add-food"
                        onClick={() => handleOpenAddModal(cat.id)}
                        title={`Add food to ${cat.name}`}
                      >
                        <IconPlus size={14} />
                        <span>Add Food</span>
                      </button>
                    </div>

                    {/* Meal Food Items List */}
                    {items.length > 0 ? (
                      <div className="meal-items-list">
                        {items.map((item) => (
                          <div className="meal-food-row" key={item.id}>
                            <div className="food-row-left">
                              <div className="food-icon-wrap">
                                {item.isRecipe ? (
                                  <IconChefHat size={18} color="#0284c7" />
                                ) : (
                                  <IconFoodCategory
                                    category={item.food?.category || ''}
                                    size={18}
                                    color="#0284c7"
                                  />
                                )}
                              </div>
                              <div className="food-details">
                                <div className="food-name-row">
                                  <span className="food-title">{item.food?.name || 'Food Item'}</span>
                                  {item.isRecipe && <span className="food-recipe-badge">Recipe</span>}
                                </div>
                                <div className="food-meta">
                                  <span>{item.quantity} {item.unit}</span>
                                  <span className="meta-sep">·</span>
                                  <span>P: {item.protein}g</span>
                                  <span className="meta-sep">·</span>
                                  <span>C: {item.carbs}g</span>
                                  <span className="meta-sep">·</span>
                                  <span>F: {item.fat}g</span>
                                  {item.timestamp && (
                                    <>
                                      <span className="meta-sep">·</span>
                                      <span className="food-time">{item.timestamp}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="food-row-right">
                              <span className="food-cals">{item.calories} kcal</span>
                              <div className="food-actions">
                                <button
                                  type="button"
                                  className="btn-item-action"
                                  onClick={() => handleOpenEditModal(item)}
                                  title="Edit portion"
                                  aria-label="Edit portion"
                                >
                                  <IconEdit size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-item-action delete"
                                  onClick={() => handlePromptDelete(item)}
                                  title="Delete item"
                                  aria-label="Delete item"
                                >
                                  <IconTrash size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Clean Subtle Empty Meal State */
                      <div
                        className="meal-empty-slot"
                        onClick={() => handleOpenAddModal(cat.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleOpenAddModal(cat.id);
                        }}
                      >
                        <IconPlus size={14} color="#94a3b8" />
                        <span>Log {cat.name.toLowerCase()}</span>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CLEAN RECIPES & MEAL IDEAS CATALOG               */}
        {/* ======================================================== */}
        {activeTab === 'recipes' && (
          <section className="recipes-catalog-section">
            {/* Search and Category Filters */}
            <div className="recipes-controls">
              <div className="recipes-search-wrap">
                <IconSearch size={17} color="#94a3b8" />
                <input
                  type="text"
                  className="recipes-search-field"
                  placeholder="Search recipes, high protein meals, ingredients..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                />
              </div>

              {/* Meal Filter */}
              <div className="recipe-filter-group">
                {['all', 'breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    className={`recipe-filter-btn ${recipeMealTypeFilter === meal ? 'active' : ''}`}
                    onClick={() => setRecipeMealTypeFilter(meal)}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="recipe-categories-row">
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`recipe-cat-chip ${recipeCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setRecipeCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recipes Cards Grid */}
            <div className="recipes-grid">
              {filteredRecipes.map((recipe) => (
                <div className="clean-recipe-card" key={recipe.id}>
                  <div className="recipe-header">
                    <div>
                      <span className="recipe-cat-badge">{recipe.category}</span>
                      <h3 className="recipe-title">{recipe.name}</h3>
                      <p className="recipe-subtitle">{recipe.subtitle}</p>
                    </div>
                    <span className="recipe-time">
                      <IconClock size={13} /> {recipe.prepTime}
                    </span>
                  </div>

                  {/* Clean Macro Row */}
                  <div className="recipe-macro-row">
                    <div className="recipe-macro-cell">
                      <span className="val highlight">{recipe.calories}</span>
                      <span className="lbl">kcal</span>
                    </div>
                    <div className="recipe-macro-cell">
                      <span className="val">{recipe.protein}g</span>
                      <span className="lbl">Protein</span>
                    </div>
                    <div className="recipe-macro-cell">
                      <span className="val">{recipe.carbs}g</span>
                      <span className="lbl">Carbs</span>
                    </div>
                    <div className="recipe-macro-cell">
                      <span className="val">{recipe.fat}g</span>
                      <span className="lbl">Fat</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="recipe-actions">
                    <button
                      type="button"
                      className="btn-view-recipe-clean"
                      onClick={() => setSelectedRecipeDetail(recipe)}
                    >
                      <IconSparkles size={14} />
                      <span>Recipe &amp; Steps</span>
                    </button>

                    <button
                      type="button"
                      className="btn-log-recipe-clean"
                      onClick={() => handleLogRecipeDirect(recipe, recipe.mealType || 'lunch')}
                    >
                      <IconPlus size={14} />
                      <span>Log to {recipe.mealType || 'Meal'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="clean-empty-recipes">
                <p>No recipes match your current search.</p>
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setRecipeSearch('');
                    setRecipeCategoryFilter('All');
                    setRecipeMealTypeFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Add / Edit Food Modal */}
      <AddFoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveFood}
        editItem={editItem}
        defaultMealType={activeMealType}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipeDetail}
        isOpen={!!selectedRecipeDetail}
        onClose={() => setSelectedRecipeDetail(null)}
        onLogRecipe={handleLogRecipeFromModal}
        defaultMealType={selectedRecipeDetail?.mealType || 'lunch'}
        currentSelectedDate={selectedDate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item={deleteItem}
      />
    </div>
  );
}
