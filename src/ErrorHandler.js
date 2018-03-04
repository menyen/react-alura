import PubSub from 'pubsub-js';

export default class ErrorHandler {
  displayError(response) {
    for (var i = 0; i < response.errors.length; i++) {
      PubSub.publish("validation-error", response.errors[i]);
    }
  }
}