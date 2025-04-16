class TrazmoHeader extends HTMLElement {
  connectedCallback() {
    fetch('./templates/header.html')
    .then(response => response.text())
    .then(html => {
      this.innerHTML = html;
    });
  }
}

class TrazmoFooter extends HTMLElement {
  connectedCallback() {
    fetch('./templates/footer.html')
    .then(response => response.text())
    .then(html => {
      this.innerHTML = html;
    });
  }
}

export function registerCustomElements() {
    customElements.define('trazmo-header', TrazmoHeader);
    customElements.define('trazmo-footer', TrazmoFooter);
  }