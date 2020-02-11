import {ChangeDetectorRef} from '@angular/core';
import { LoadingAbstract } from '../loading/loading.abstract';
import { LatLngBoundsLiteral } from '@agm/core';
import { DataPositionInterface } from '@sports-alliance/sports-lib/lib/data/data.position.interface';
import { MapThemes } from '@sports-alliance/sports-lib/lib/users/user.map.settings.interface';

declare function require(moduleName: string): any;
const mapStyles = require('./map-styles.json');

export abstract class MapAbstract extends LoadingAbstract {

  constructor(changeDetector: ChangeDetectorRef) {
    super(changeDetector)
  }

  getBounds(postions: DataPositionInterface[]): LatLngBoundsLiteral {
    if (!postions.length) {
      return <LatLngBoundsLiteral>{
        east: 0,
        west: 0,
        north: 0,
        south: 0,
      };
    }
    const mostEast = postions.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.longitudeDegrees < latLongPair.longitudeDegrees) ? latLongPair : acc;
    });
    const mostWest = postions.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.longitudeDegrees > latLongPair.longitudeDegrees) ? latLongPair : acc;
    });

    const mostNorth = postions.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.latitudeDegrees < latLongPair.latitudeDegrees) ? latLongPair : acc;
    });

    const mostSouth = postions.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.latitudeDegrees > latLongPair.latitudeDegrees) ? latLongPair : acc;
    });

    return <LatLngBoundsLiteral>{
      east: mostEast.longitudeDegrees,
      west: mostWest.longitudeDegrees,
      north: mostNorth.latitudeDegrees,
      south: mostSouth.latitudeDegrees,
    };
  }

  getStyles(mapTheme: MapThemes) {
    return mapStyles[mapTheme]
  }
}
