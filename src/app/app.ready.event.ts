// Import the core angular services.
import { DOCUMENT } from "@angular/platform-browser";
import { Inject } from "@angular/core";
import { Injectable } from "@angular/core";

/*
    Event that fires when the application is ready
*/
@Injectable()
export class AppReadyEvent {

    private doc: Document;
    private isAppReady: boolean;
    
    constructor( @Inject( DOCUMENT ) doc: any ) {

        this.doc = doc;
        this.isAppReady = false;
    }

    /// PUBLIC METHODS /////////////////////////////////////////////////////////////////////////////

    // NOTE: In this particular implementation of this service on this PLATFORM, this
    // simply triggers the event on the DOM (Document Object Model); however, one could
    // easily imagine this event being triggered on an Observable or some other type of
    // message transport that makes more sense for a different platform. Nothing about
    // the DOM-interaction leaks outside of this service.
    public trigger() : void {

        // If the app-ready event has already been triggered, just ignore any subsequent
        // calls to trigger it again.
        if ( this.isAppReady ) {
            return;
        }

        var bubbles = true;
        var cancelable = false;

        this.doc.dispatchEvent( this.createEvent( "appready", bubbles, cancelable ) );
        this.isAppReady = true;
    }


    /// PRIVATE METHODS /////////////////////////////////////////////////////////////////////////////


    // I create and return a custom event with the given configuration.
    private createEvent(
        eventType: string,
        bubbles: boolean,
        cancelable: boolean
        ) : Event {

        // IE (shakes fist) uses some other kind of event initialization. As such,
        // we'll default to trying the "normal" event generation and then fallback to
        // using the IE version.
        try {

            var customEvent: any = new CustomEvent(
                eventType,
                {
                    bubbles: bubbles,
                    cancelable: cancelable
                }
            );

        } catch ( error ) {

            var customEvent: any = this.doc.createEvent( "CustomEvent" );

            customEvent.initCustomEvent( eventType, bubbles, cancelable );

        }
        return( customEvent );
    }
}