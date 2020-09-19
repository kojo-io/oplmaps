import { HammerGestureConfig } from '@angular/platform-browser';
import * as hammer from 'hammerjs';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MyHammerConfig extends HammerGestureConfig {
    overrides = {
        swipe: { direction: hammer.DIRECTION_UP },
        pinch: { enable: false },
        rotate: { enable: false }
    } as any;
}
