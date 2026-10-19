import { useState } from 'react';
import { scaleRecipeNutrients } from '../../data/recipesDatabase';
import {
  IconUtensils,
  IconClock,
  IconCheck,
  IconBookOpen,
} from '../common/Icons';
import '../../styles/RecipeDetailModal.css';

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onLogRecipe,
  defaultMealType = 'lunch',
  currentSelectedDate = '',
}) {
  const [servings, setServings] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState(recipe?.mealType || defaultMealType);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  if (!isOpen || !recipe) return null;

  const currentNutrients = scaleRecipeNutrients(recipe, servings);

  const handleToggleIngredient = (index) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleServingChange = (delta) => {
    const next = Math.max(0.5, Math.min(6, parseFloat((servings + delta).toFixed(1))));
    setServings(next);
  };

  const handleLogToDiet = () => {
    const logItem = {
      id: `log-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mealType: selectedMealType,
      isRecipe: true,
      recipeId: recipe.id,
      food: {
        id: recipe.id,
        name: `${recipe.name} (${servings} ${servings === 1 ? 'serving' : 'servings'})`,
        category: recipe.category || 'Recipe',
        unit: 'serving',
        servingSize: servings,
      },
      quantity: servings,
      unit: 'serving',
      calories: currentNutrients.calories,
      protein: currentNutrients.protein,
      carbs: currentNutrients.carbs,
      fat: currentNutrients.fat,
      fiber: currentNutrients.fiber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogRecipe(logItem, currentSelectedDate);
    setLoggedSuccess(true);
    setTimeout(() => {
      setLoggedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="recipe-modal-backdrop" onClick={onClose}>
      <div
        className="recipe-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="recipe-modal-header">
          <div className="recipe-header-main">
            <div className="recipe-tags-row">
              <span className="recipe-tag-category">{recipe.category}</span>
              <span className="recipe-tag-meta">
                <IconClock size={13} /> {recipe.prepTime} prep · {recipe.cookTime} cook
              </span>
              <span className="recipe-tag-meta">{recipe.difficulty}</span>
            </div>
            <h2>{recipe.name}</h2>
            <p className="recipe-modal-sub">{recipe.subtitle}</p>
          </div>

          <button
            type="button"
            className="recipe-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="recipe-modal-body">
          {/* Nutrition & Servings Summary Strip */}
          <div className="recipe-nutrition-strip">
            <div className="nutrition-servings-col">
              <span className="servings-label">Servings:</span>
              <div className="servings-stepper">
                <button
                  type="button"
                  className="btn-step"
                  onClick={() => handleServingChange(-0.5)}
                  disabled={servings <= 0.5}
                >
                  –
                </button>
                <span className="serv-value">{servings}x</span>
                <button
                  type="button"
                  className="btn-step"
                  onClick={() => handleServingChange(0.5)}
                  disabled={servings >= 6}
                >
                  +
                </button>
              </div>
            </div>

            <div className="nutrition-metrics-grid">
              <div className="nutrition-metric-box highlight">
                <span className="metric-val">{currentNutrients.calories}</span>
                <span className="metric-lbl">Calories</span>
              </div>
              <div className="nutrition-metric-box">
                <span className="metric-val">{currentNutrients.protein}g</span>
                <span className="metric-lbl">Protein</span>
              </div>
              <div className="nutrition-metric-box">
                <span className="metric-val">{currentNutrients.carbs}g</span>
                <span className="metric-lbl">Carbs</span>
              </div>
              <div className="nutrition-metric-box">
                <span className="metric-val">{currentNutrients.fat}g</span>
                <span className="metric-lbl">Fat</span>
              </div>
              {currentNutrients.fiber > 0 && (
                <div className="nutrition-metric-box">
                  <span className="metric-val">{currentNutrients.fiber}g</span>
                  <span className="metric-lbl">Fiber</span>
                </div>
              )}
            </div>
          </div>

          {/* 2-Column: Ingredients & Directions */}
          <div className="recipe-details-columns">
            {/* Ingredients */}
            <div className="recipe-col-section">
              <div className="col-header">
                <IconUtensils size={16} color="#0284c7" />
                <h3>Ingredients ({recipe.ingredients.length})</h3>
              </div>

              <div className="ingredients-list-clean">
                {recipe.ingredients.map((ing, idx) => {
                  const scaledQty = parseFloat(((ing.quantity * servings) / (recipe.servings || 1)).toFixed(1));
                  const scaledCals = Math.round((ing.calories * servings) / (recipe.servings || 1));
                  const isChecked = !!checkedIngredients[idx];

                  return (
                    <div
                      key={idx}
                      className={`ingredient-item-clean ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleToggleIngredient(idx)}
                    >
                      <div className="clean-checkbox">
                        {isChecked && <IconCheck size={12} color="#ffffff" />}
                      </div>
                      <span className="ing-name">{ing.name}</span>
                      <span className="ing-portion">{scaledQty} {ing.unit} · {scaledCals} kcal</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Directions */}
            <div className="recipe-col-section">
              <div className="col-header">
                <IconBookOpen size={16} color="#0284c7" />
                <h3>Directions</h3>
              </div>

              <div className="directions-list-clean">
                {recipe.instructions.map((step, idx) => (
                  <div className="direction-step-clean" key={idx}>
                    <span className="step-num">{idx + 1}</span>
                    <span className="step-text">{step}</span>
                  </div>
                ))}
              </div>

              {recipe.chefTip && (
                <div className="chef-tip-clean">
                  <strong>Tip:</strong> {recipe.chefTip}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="recipe-modal-footer">
          <div className="meal-choice-group">
            <span className="meal-choice-label">Log to:</span>
            <div className="meal-choice-pills">
              {['breakfast', 'lunch', 'dinner', 'snacks'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`meal-pill-btn ${selectedMealType === type ? 'active' : ''}`}
                  onClick={() => setSelectedMealType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer-btns">
            <button
              type="button"
              className="btn-cancel-clean"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-log-clean-submit"
              onClick={handleLogToDiet}
              disabled={loggedSuccess}
            >
              {loggedSuccess ? (
                <>
                  <IconCheck size={16} /> Added!
                </>
              ) : (
                `+ Log to ${selectedMealType} (${currentNutrients.calories} kcal)`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
