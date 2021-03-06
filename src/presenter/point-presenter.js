import EditPointView from '../view/edit-point-view.js';
import PointView from '../view/point-view.js';
import {RenderPosition, render, replace, remove} from '../utils/render.js';
import {Mode, UserAction, UpdateType, State} from '../utils/const.js';
import {isDatesEqual} from '../utils/utils.js';

export default class PointPresenter {
  #listPointContainer = null;
  #changeDate = null;
  #changeMode = null;

  #pointComponent = null;
  #editPointComponent = null;

  #point = null;
  #mode = Mode.DEFAULT;

  constructor(listPointContainer, changeDate, changeMode) {
    this.#listPointContainer = listPointContainer;
    this.#changeDate = changeDate;
    this.#changeMode = changeMode;
  }

  init = (point, OFFERS, DESTINATIONS) => {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditPointComponent = this.#editPointComponent;

    this.#pointComponent = new PointView(point);
    this.#editPointComponent = new EditPointView(point, OFFERS, DESTINATIONS);

    this.#pointComponent.setOnPointClick(this.#onClick);
    this.#pointComponent.setOnFavoriteClick(this.#onFavoriteClick);
    this.#editPointComponent.setOnFormSubmit(this.#onClickToSave);
    this.#editPointComponent.setOnEditPointClick(this.#onClickToClose);
    this.#editPointComponent.setOnDeleteClick(this.#onClickToDelete);

    if (prevPointComponent === null || prevEditPointComponent === null) {
      render(this.#listPointContainer, this.#pointComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevEditPointComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevEditPointComponent);
  }

  destroy = () => {
    remove(this.#pointComponent);
    remove(this.#editPointComponent);
  }

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  setViewState = (state) => {
    if (this.#mode === Mode.DEFAULT) {
      return;
    }

    const resetFormState = () => {
      this.#editPointComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    switch (state) {
      case State.SAVING:
        this.#editPointComponent.updateData({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this.#editPointComponent.updateData({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case State.ABORTING:
        this.#pointComponent.shake(resetFormState);
        this.#editPointComponent.shake(resetFormState);
        break;
    }
  }

  #replacePointToForm = () => {
    replace(this.#editPointComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#onEscKeyDown);

    this.#changeMode();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editPointComponent);
    document.removeEventListener('keydown', this.#onEscKeyDown);
    this.#mode = Mode.DEFAULT;
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  #onFavoriteClick = () => {
    this.#changeDate(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    );
  }

  #onClick = () => {
    this.#replacePointToForm();
    this.#editPointComponent.setDatepickerTimeStart();
    this.#editPointComponent.setDatepickerTimeEnd();
  }

  #onClickToSave = (update) => {
    const isMinorUpdate = !isDatesEqual(this.#point.timeStart, update.timeStart);

    this.#changeDate(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update
    );
  }

  #onClickToClose = () => {
    this.#editPointComponent.reset(this.#point);
    this.#replaceFormToPoint();
  }

  #onClickToDelete = (point) => {
    this.#changeDate(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  }
}
