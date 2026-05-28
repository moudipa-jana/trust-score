import Emitter from 'events';

class Events extends Emitter {}

const EventEmitter = new Events();
EventEmitter.setMaxListeners(0);

export default EventEmitter;
