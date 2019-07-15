import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {AgmMap, LatLngBoundsLiteral, PolyMouseEvent} from '@agm/core';
import {EventColorService} from '../../../../services/color/app.event.color.service';
import {EventInterface} from 'quantified-self-lib/lib/events/event.interface';
import {ActivityInterface} from 'quantified-self-lib/lib/activities/activity.interface';
import {PointInterface} from 'quantified-self-lib/lib/points/point.interface';
import {LapInterface} from 'quantified-self-lib/lib/laps/lap.interface';
import {
  ControlPosition,
  MapTypeControlOptions,
  MapTypeControlStyle,
  ZoomControlOptions
} from '@agm/core/services/google-maps-types';
import {Log} from 'ng2-logger/browser';
import {EventService} from '../../../../services/app.event.service';
import {DataLatitudeDegrees} from 'quantified-self-lib/lib/data/data.latitude-degrees';
import {DataLongitudeDegrees} from 'quantified-self-lib/lib/data/data.longitude-degrees';
import {Subscription} from 'rxjs';
import {User} from 'quantified-self-lib/lib/users/user';
import {DataPositionInterface} from 'quantified-self-lib/lib/data/data.position.interface';
import {AppThemes} from 'quantified-self-lib/lib/users/user.app.settings.interface';
import {LapTypes} from 'quantified-self-lib/lib/laps/lap.types';
import {MapThemes} from 'quantified-self-lib/lib/users/user.map.settings.interface';

declare function require(moduleName: string): any;
const mapStyles = require('./map-styles.json');

@Component({
  selector: 'app-event-card-map',
  templateUrl: './event.card.map.component.html',
  styleUrls: ['./event.card.map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EventCardMapComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @ViewChild(AgmMap, {static: false}) agmMap;
  @Input() event: EventInterface;
  @Input() user: User;
  @Input() selectedActivities: ActivityInterface[];
  @Input() isVisible: boolean;
  @Input() theme: MapThemes;
  @Input() showLaps: boolean;
  @Input() showArrows: boolean;
  @Input() lapTypes: LapTypes[] = [];


  private streamsSubscriptions: Subscription[] = [];
  public activitiesMapData: MapData[] = [];
  public isLoading = true;
  public noMapData = false;
  public openedLapMarkerInfoWindow: LapInterface;
  public openedActivityStartMarkerInfoWindow: ActivityInterface;
  public clickedPoint: PointInterface;
  public mapTypeControlOptions: MapTypeControlOptions = {
    // mapTypeIds: [MapTypeId.HYBRID, MapTypeId.ROADMAP, MapTypeId.SATELLITE, MapTypeId.TERRAIN],
    // mapTypeIds: ['hybrid', 'roadmap', 'satellite', 'terrain'],
    position: ControlPosition.LEFT_TOP,
    style: MapTypeControlStyle.HORIZONTAL_BAR
  };

  public zoomControlOptions: ZoomControlOptions = {
    position: ControlPosition.RIGHT_TOP
  };

  private logger = Log.create('EventCardMapAGMComponent');

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private eventService: EventService,
    public eventColorService: EventColorService) {
  }


  ngOnInit() {
    if (!this.user || !this.event) {
      throw new Error('Component needs events and user');
    }
  }

  ngAfterViewInit(): void {
  }


  ngOnChanges(simpleChanges) {
    // debugger
    // // If no operational changes return
    if ((simpleChanges.event
      || simpleChanges.selectedActivities
      || simpleChanges.lapTypes
      || simpleChanges.showLaps)) {
      this.bindToNewData();
    }

    this.resizeMapToBounds();

    // if (simpleChanges.isVisible)

    // // Get the new activityMapData
    // this.activitiesMapData = this.cacheNewData();
    // // No need to do anything if the base did not change (Event)
    // if (!simpleChanges.event) {
    //   return;
    // }
    // // If the event has changed then fit the bounds to show the new location
    // this.agmMap.triggerResize().then(() => {
    //   const googleMaps: GoogleMapsAPIWrapper = this.agmMap._mapsWrapper;
    //   googleMaps.fitBounds(this.getBounds());
    // });

  }

  private bindToNewData() {
    this.isLoading = true;
    this.noMapData = false;
    this.activitiesMapData = [];
    this.unSubscribeFromAll();
    this.selectedActivities.forEach((activity) => {
      this.streamsSubscriptions.push(this.eventService.getStreamsByTypes(this.user, this.event.getID(), activity.getID(), [DataLatitudeDegrees.type, DataLongitudeDegrees.type])
        .subscribe((streams) => {
          // In case we are in the middle of a deletion of one of the lat/long streams or no streams
          if (!streams.length || streams.length !== 2) {
            // @todo improve
            const index = this.activitiesMapData.findIndex((activityMapData) => {
              return activityMapData.activity.getID() === activity.getID()
            });
            if (index !== -1) {
              this.activitiesMapData.splice(index, 1);
            }
            this.isLoading = false;
            if (!this.activitiesMapData.length) {
              this.noMapData = true;
            }
            this.changeDetectorRef.detectChanges();
            return;
          }

          // Start building map data
          const latData = streams[0].getNumericData();
          const longData = streams[1].getNumericData();

          // If no numeric data for any reason
          if (!latData.length || !longData.length) {
            this.isLoading = false;
            if (!this.activitiesMapData.length) {
              this.noMapData = true;
            }
            return;
          }

          this.activitiesMapData.push({
            activity: activity,
            positions: latData.reduce((latLongArray, value, index) => {
              latLongArray[index] = {
                latitudeDegrees: latData[index],
                longitudeDegrees: longData[index],
              };
              return latLongArray
            }, []),
            laps: activity.getLaps().reduce((laps, lap) => {
              // @todo gives back too big arrays should check the implementation of the activity method
              const positionData = activity.getSquashedPositionData(lap.startDate, lap.endDate, streams[0], streams[1]);
              if (!positionData.length || !this.showLaps) {
                return laps;
              }
              if (this.lapTypes.indexOf(lap.type) === -1){
                return laps;
              }
              laps.push({
                lap: lap,
                lapPosition: {
                  latitudeDegrees: positionData[positionData.length - 1].latitudeDegrees,
                  longitudeDegrees: positionData[positionData.length - 1].longitudeDegrees
                }
              });
              return laps;
            }, [])
          });

          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.resizeMapToBounds();
        }))
    })
  }

  // private cacheNewData(): MapData[] {
  //   const t0 = performance.now();
  //   const activitiesMapData = [];
  //   this.selectedActivities.forEach((activity) => {
  //     let activityPoints: PointInterface[];
  //     if (this.showData) {
  //       activityPoints = activity.getPointsInterpolated();
  //     } else {
  //       activityPoints = activity.getPoints()
  //     }
  //     activityPoints = activityPoints.filter((point) => point.getPosition());
  //     let lowNumberOfSatellitesPoints: PointInterface[] = [];
  //     if (this.showDataWarnings) {
  //       lowNumberOfSatellitesPoints = activityPoints.filter((point) => {
  //         const numberOfSatellitesData = point.getDataByType(DataNumberOfSatellites.type);
  //         if (!numberOfSatellitesData) {
  //           return false
  //         }
  //         return numberOfSatellitesData.getValue() < 7;
  //       });
  //     }
  //     // If the activity has no positions skip
  //     if (!activityPoints.length) {
  //       return;
  //     }
  //     // Check for laps with position
  //     const lapsWithPosition = activity.getLaps()
  //       .filter((lap) => {
  //         if (this.showLaps && (lap.type === LapTypes.AutoLap || lap.type === LapTypes.Distance)) {
  //           return true;
  //         }
  //         if (this.showManualLaps && lap.type === LapTypes.Manual) {
  //           return true;
  //         }
  //         return false;
  //       })
  //       .reduce((lapsArray, lap) => {
  //         const lapPoints = this.event.getPointsWithPosition(lap.startDate, lap.endDate, [activity]);
  //         if (lapPoints.length) {
  //           lapsArray.push({
  //             lap: lap,
  //             lapPoints: lapPoints,
  //             lapEndPoint: lapPoints[lapPoints.length - 1],
  //           })
  //         }
  //         return lapsArray;
  //       }, []);
  //     // Create the object
  //     activitiesMapData.push({
  //       activity: activity,
  //       positions: activityPoints,
  //       lowNumberOfSatellitesPoints: lowNumberOfSatellitesPoints,
  //       activityStartPoint: activityPoints[0],
  //       lapsWithPosition: lapsWithPosition,
  //     });
  //   });
  //   const t1 = performance.now();
  //   this.logger.info(`Parsed activityMapData after ${t1 - t0}ms`);
  //   return activitiesMapData;
  // }

  getBounds(): LatLngBoundsLiteral {
    const pointsWithPosition = this.activitiesMapData.reduce((pointsArray, activityData) => pointsArray.concat(activityData.positions), []);
    if (!pointsWithPosition.length) {
      return <LatLngBoundsLiteral>{
        east: 0,
        west: 0,
        north: 0,
        south: 0,
      };
    }
    const mostEast = pointsWithPosition.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.longitudeDegrees < latLongPair.longitudeDegrees) ? latLongPair : acc;
    });
    const mostWest = pointsWithPosition.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.longitudeDegrees > latLongPair.longitudeDegrees) ? latLongPair : acc;
    });

    const mostNorth = pointsWithPosition.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.latitudeDegrees < latLongPair.latitudeDegrees) ? latLongPair : acc;
    });

    const mostSouth = pointsWithPosition.reduce((acc: { latitudeDegrees: number, longitudeDegrees: number }, latLongPair: { latitudeDegrees: number, longitudeDegrees: number }) => {
      return (acc.latitudeDegrees > latLongPair.latitudeDegrees) ? latLongPair : acc;
    });

    return <LatLngBoundsLiteral>{
      east: mostEast.longitudeDegrees,
      west: mostWest.longitudeDegrees,
      north: mostNorth.latitudeDegrees,
      south: mostSouth.latitudeDegrees,
    };
  }

  openLapMarkerInfoWindow(lap) {
    this.openedLapMarkerInfoWindow = lap;
    this.openedActivityStartMarkerInfoWindow = void 0;
  }

  openActivityStartMarkerInfoWindow(activity) {
    this.openedActivityStartMarkerInfoWindow = activity;
    this.openedLapMarkerInfoWindow = void 0;
  }

  getMarkerIcon(activity: ActivityInterface) {
    return {
      path: 'M22-48h-44v43h16l6 5 6-5h16z',
      fillColor: this.eventColorService.getActivityColor(this.event, activity),
      fillOpacity: 1,
      strokeColor: '#FFF',
      strokeWeight: 0.5,
      scale: 0.5,
      labelOrigin: {
        x: 0,
        y: -24
      }
    }
  }

  //
  getHomeMarkerIcon(activity: ActivityInterface) {
    return {
      path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      fillColor: this.eventColorService.getActivityColor(this.event, activity),
      fillOpacity: 1,
      strokeColor: '#FFF',
      strokeWeight: 0.8,
      scale: 1.2,
      anchor: {x: 12, y: 12}
    }
  }

  getFlagMarkerIcon(activity: ActivityInterface) {
    return {
      path: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
      fillColor: this.eventColorService.getActivityColor(this.event, activity),
      fillOpacity: 1,
      strokeColor: '#FFF',
      strokeWeight: 0.8,
      scale: 1.5,
      anchor: {x: 6, y: 24}
    }
  }

  // @todo make prop
  getLabel(text) {
    return {
      color: 'white',
      fontSize: '14px',
      text: text
    }
  }

  getStyles(appTheme: MapThemes) {
    return mapStyles[appTheme]
  }

  lineClick(event: PolyMouseEvent, points: PointInterface[]) {
    // const nearestPoint = (new GeoLibAdapter()).getNearestPointToPosition({
    //   latitudeDegrees: event.latLng.lat(),
    //   longitudeDegrees: event.latLng.lng(),
    // }, positions);
    // if (nearestPoint) {
    //   this.clickedPoint = nearestPoint;
    // }
  }

  getMapValuesAsArray<K, V>(map: Map<K, V>): V[] {
    return Array.from(map.values());
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width) {
    this.resizeMapToBounds();
  }

  ngOnDestroy(): void {
    this.unSubscribeFromAll();
    this.streamsSubscriptions.forEach((streamsSubscription) => {
      streamsSubscription.unsubscribe()
    })
  }

  private unSubscribeFromAll() {
    this.streamsSubscriptions.forEach((streamsSubscription) => {
      streamsSubscription.unsubscribe()
    });
  }

  private resizeMapToBounds() {
    if (!this.agmMap) {
      return;
    }
    this.agmMap.triggerResize().then(() => {
      if (!this.agmMap) {
        return;
      }
      this.agmMap._mapsWrapper.fitBounds(this.getBounds())
    });
  }
}


export interface MapData {
  activity: ActivityInterface;
  positions: DataPositionInterface[];
  laps: {
    lap: LapInterface,
    lapPosition: DataPositionInterface,
    symbol: any,
  }[]
}
