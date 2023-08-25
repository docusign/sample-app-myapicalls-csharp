import { Directive, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';

@Directive({
  selector: '[appCommaBreak]'
})
export class CommaBreakDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateText();
    }, 0);
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: Event): void {
    this.updateText();
  }

  private updateText(): void {
    const container = this.el.nativeElement;
    const originalText = container.innerText.replace(/[\n\r]+/g, '');
    const parts = originalText.split(',');

    let newText = '';
    let width = 0;
    
    parts.forEach((part: string, index: number) => {
      if (index === 0) {
        newText = part;
        this.renderer.setProperty(container, 'innerText', newText);
        width = container.offsetWidth;

      } else {
        const potentialText = newText + ',' + part;
        this.renderer.setProperty(container, 'innerText', potentialText);
        if (container.scrollWidth > width) {
          newText += ',\n' + part;
        } else {
          newText += ',' + part;
        }
      }
    });

    this.renderer.setProperty(container, 'innerText', newText);
    this.renderer.setStyle(container, 'white-space', 'pre-line');
  }
}