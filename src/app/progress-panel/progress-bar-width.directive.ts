import { OnChanges, SimpleChange, Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive(
    { selector: '[uProgressWidth]' }
    )

export class ProgressWidthDirective implements OnChanges  {
    
    @Input('uProgressWidth') progressWidth: number;
    
    private defaultWidth: number = 0;

    ngOnChanges(changes: {
        progressWidth: any;[value: number]: SimpleChange
}) {
        this.setWidth(this.progressWidth || this.defaultWidth);
        if (changes.progressWidth.previousValue !== undefined) {
            this.setHeight();
        }

    }
    private setWidth(width: number) {
        this.renderer.setElementStyle(this.el.nativeElement, 'width', width.toString() +"%");

    }

    private setHeight() {
        this.renderer.setElementStyle(this.el.nativeElement.parentElement, 'height', "20px");
        setTimeout(() => {this.renderer.setElementStyle(this.el.nativeElement.parentElement, 'height', "10px");}, 600) 
    }
    constructor(private el: ElementRef, private renderer: Renderer) { }
}