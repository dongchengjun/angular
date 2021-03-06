import {FIELD, print} from 'facade/src/lang';
import {ChangeDetector} from 'change_detection/change_detection';
import {VmTurnZone} from 'core/src/zone/vm_turn_zone';
import {ListWrapper} from 'facade/src/collection';

export class LifeCycle {
  _changeDetector:ChangeDetector;
  _enforceNoNewChanges:boolean;

  constructor(changeDetector:ChangeDetector, enforceNoNewChanges:boolean = false) {
    this._changeDetector = changeDetector;
    this._enforceNoNewChanges = enforceNoNewChanges;
  }

  registerWith(zone:VmTurnZone) {
    // temporary error handler, we should inject one
    var errorHandler = (exception, stackTrace) => {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      print(`${exception}\n\n${longStackTrace}`);
      throw exception;
    };

    zone.initCallbacks({
      onErrorHandler: errorHandler,
      onTurnDone: () => this.tick()
    });
  }

  tick() {
    this._changeDetector.detectChanges();
    if (this._enforceNoNewChanges) {
      this._changeDetector.checkNoChanges();
    }
  }
}