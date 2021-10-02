import { OnChanges, SimpleChange, Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive(
    { selector: '[uProgressWidth]' }
    )

export class ProgressWidthDirective implements OnChanges  {
    
    @Input('uProgressWidth') progressWidth: number;
    
    private defaultWidth: number = 0;

    ngOnChanges(changes: {[value: number]: SimpleChange}) {
        this.setWidth(this.progressWidth || this.defaultWidth);

    }
    private setWidth(width: number) {
        this.renderer.setElementStyle(this.el.nativeElement, 'width', width.toString() +"%");
    }
    constructor(private el: ElementRef, private renderer: Renderer) { }
}