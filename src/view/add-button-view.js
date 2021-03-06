import AbstractView from './abstract-view.js';

const createAddButtonTemplate = () => (
  '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>'
);

export default class AddButtonView extends AbstractView {
  get getTemplate() {
    return createAddButtonTemplate();
  }

  setOnClickAddButton = (callback) => {
    this._callback.clickAddButton = callback;
    this.getElement.addEventListener('click', this.#onClickAddButton);
  }

  #onClickAddButton = (evt) => {
    evt.preventDefault();
    this._callback.clickAddButton();
    this.getElement.disabled = true;
  }
}
