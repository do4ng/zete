export default function insertWorker(code: string): string {
  return `${code}

if (!window.sapianseRenderer) window.sapianseRenderer = {}

/*rendering*/
window.sapianseData = JSON.parse(document.querySelector("#__sapianse_data").innerText);

const rendering = new Component({
  target: document.querySelector('#__sapianse'),
  props: window.sapianseData.props || {},
  hydrate: true
})

window.sapianseRenderer[window.sapianseData.page] = Component

function AddLinkListener() {
  document.querySelectorAll("a").forEach((el) => {
    el.addEventListener('click', async (event) => {
      linkListener(event, el.getAttribute('href'));
      renderer(el.getAttribute('href'));
    });
  })
}

AddLinkListener();

function linkListener(e, link) {
  window.history.pushState('page2', 'Title', link);
  e.preventDefault();
}

window.addEventListener('popstate', function (event) {
  renderer(window.location.pathname);
});

async function renderer(href) {
  const page = await (await fetch(href)).text();
  const virtualPage = document.createElement('div');
  virtualPage.innerHTML = page;
  document.getElementById("__sapianse").innerHTML = virtualPage.querySelector("#__sapianse").innerHTML

  virtualPage.querySelectorAll("script").forEach(src => {
    if (src.getAttribute('src')?.startsWith("/.zete")) {
      // already loaded
      if (document.querySelectorAll(\`script[src='\${src.getAttribute('src')}']\`).length === 0){
        const scripttag = document.createElement('script');
        scripttag.setAttribute('type', 'module');
        scripttag.setAttribute('src', src.getAttribute("src"));
        document.head.appendChild(scripttag);
      }
      const virData =  JSON.parse(virtualPage.querySelector("#__sapianse_data").innerText);
      document.getElementById("__sapianse_data").innerText = JSON.stringify(virData);

      // page rendering

      let pageRenderer = window.sapianseRenderer[virData.page];

      if (pageRenderer) new pageRenderer({
        target: document.querySelector('#__sapianse'),
        props: window.sapianseData.props || {},
        hydrate: true
      })
      
      AddLinkListener();
    }
  })
}
`;
}
