import {
  fakeAsync,
  async,
  inject,
  tick,
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';
//import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser/src/dom/debug/by';

// Load the implementations that should be tested
import { ProgressBarMulti } from './progress-bar-multi.component';
import { ProgressWidthDirective } from './progress-bar-width.directive'

describe('ProgressBarMulti component', () => {

    // async beforeEach
    // async call in the beforeEach, made necessary by the asynchronous TestBed.compileComponents method.
    beforeEach( async(() => {
        TestBed.configureTestingModule({
        declarations: [ ProgressBarMulti, ProgressWidthDirective ],
        })
        //The TestBed.compileComponents method asynchronously compiles all the components configured in its current testing module. 
        //After it completes, external templates and css files, have been "inlined" and TestBed.createComponent can do its job synchronously.
        .compileComponents(); 
    }));

    function initialiseComponent(comp: ProgressBarMulti)
    {
        comp.title ='title';
        comp.max = 100;
        comp.states = [{ value: 33, color: '#ff0000' },{ value: 33, color: '#00ff00' },{ value: 33, color: '#0000ff' }];
        comp.isTotal = false;
        comp.inactive = false;
        comp.hoverText = 'hoverText';
        return comp;
    }


 it('should set the title on the progress bar', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;

    initialiseComponent(comp);
    fixture.detectChanges();

    const title  = fixture.debugElement.query(By.css('.progress-bar-title'));
    expect(title.nativeElement.textContent).toContain(comp.title);

 });
  
 it('should set the inactive class', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.inactive = true;
    fixture.detectChanges();
    
    const container  = fixture.debugElement.query(By.css('.bar-main-container'));
    expect(container.nativeElement.classList).toContain('inactive');

 });  

 it('should NOT set the hoverText if inactive', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;

    initialiseComponent(comp);
    comp.inactive = true;
    fixture.detectChanges();

    const hoverText  = fixture.debugElement.query(By.css('.hover-text'));
    expect(hoverText).toBe(null);

 }); 

  it('should set the hoverText if active', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;

    initialiseComponent(comp);
    fixture.detectChanges();

    const hoverText  = fixture.debugElement.query(By.css('.hover-text'));
    expect(hoverText.nativeElement.textContent).toContain(comp.hoverText);
    

 }); 

 it('should set the totalBar class', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.isTotal = true;
    fixture.detectChanges();
    
    const container  = fixture.debugElement.query(By.css('.bar-main-container'));
    expect(container.nativeElement.classList).toContain('totalBar');

 });   


 it('should calculate and display total/max', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const progress  = fixture.debugElement.query(By.css('.bar-percentage'));
    expect(progress.nativeElement.textContent).toContain('99/100');

 });   

  it('should display correct colour for bar one', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_0'));
    expect(bar.styles['backgroundColor']).toEqual(comp.states[0].color);
 }); 

  it('should display correct colour for bar two', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_1'));
    expect(bar.styles['backgroundColor']).toEqual(comp.states[1].color);
 });  

  it('should display correct colour for bar three', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_2'));
    expect(bar.styles['backgroundColor']).toEqual(comp.states[2].color);
 });  

  it('should set correct width for bar one', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_0'));
    expect(bar.styles['width']).toEqual(comp.states[0].value +'%');
 });  


  it('should set correct width for bar two', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_1'));
    expect(bar.styles['width']).toEqual(comp.states[0].value + comp.states[1].value + '%');
 }); 

  it('should set correct width for bar three', () => {

    const fixture = TestBed.createComponent(ProgressBarMulti);
    let comp = fixture.componentInstance;
    
    initialiseComponent(comp);
    comp.title='should calculate and display total';
    fixture.detectChanges();
    
    const bar  = fixture.debugElement.query(By.css('#bar_2'));
    expect(bar.styles['width']).toEqual(comp.states[0].value + comp.states[1].value + comp.states[2].value +'%');
 });      
});
