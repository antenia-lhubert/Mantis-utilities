// ==UserScript==
// @name         Mantis utilities
// @namespace    https://bug.leaderinfo.com/mantisbt
// @version      2025-06-10
// @description  Liste d'utilitaires pour améliorer l'utilisation de mantis
// @author       lhubert
// @downloadURL  https://github.com/antenia-lhubert/Mantis-utilities/raw/refs/heads/main/Mantis%20utilities.user.js
// @updateURL    https://github.com/antenia-lhubert/Mantis-utilities/raw/refs/heads/main/Mantis%20utilities.user.js
// @match        https://bug.leaderinfo.com/mantisbt/view.php*
// @icon         https://bug.leaderinfo.com/mantisbt/images/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
  'use strict';

  const GLOBAL_STYLES = `
    #configuration-panel {
      position: fixed;
      top: 30px;
      right: 10px;
      padding: 35px;
      box-sizing: border-box;
      background: rgb(22, 22, 31);
      border: 1px solid rgb(85, 143, 241);
      display: flex;
      flex-direction: column;
      gap: 20px;
      z-index: 1000000;
      color: rgb(240, 240, 242);
    }

    #configuration-panel .panel-close {
      position: absolute;
      top: 5px;
      right: 5px;
      text-align: center;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      background: rgb(85, 143, 241);
      color: white;
      cursor: pointer;
    }

    #configuration-panel .title {
      margin: 0;
    }

    #configuration-panel .switch-container {
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: space-between;
    }

    #configuration-panel .switch-checkbox {
      height: 0;
      width: 0;
      visibility: hidden;
    }

    #configuration-panel .switch-fake-label {
      cursor: pointer;
      width: 40px;
      height: 20px;
      background: #ccc;
      display: block;
      border-radius: 15px;
      position: relative;
      transition: background-color 0.3s ease;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
    }

    #configuration-panel .switch-thumb {
      background: #fff;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      position: absolute;
      top: 1px;
      left: 1px;
      transition: transform 0.3s ease, background-color 0.3s ease;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    }

    #configuration-panel .switch-checkbox:checked + .switch-fake-label {
      background: rgb(85, 143, 241);
    }

    #configuration-panel .switch-checkbox:checked + .switch-fake-label .switch-thumb {
      transform: translateX(20px);
    }

    #configuration-panel .switch-checkbox:focus + .switch-fake-label {
      outline: 2px solid #007bff;
      outline-offset: 4px;
    }

    #configuration-panel input {
      color: black;
    }

    .mu_copy-note_bugnote, .mu_copy-mantis_header {
      position: relative;
    }

    .mu_copy-note_copy-button, .mu_copy-mantis_copy-button {
      position: absolute;
      text-decoration: none;
      font-size: 1.5em;
      cursor: pointer;
    }

    .mu_copy-note_copy-button {
      top: .5em;
      right: .5em;
    }

    .mu_copy-mantis_copy-button {
      top: 0;
      right: 0;
    }

    .mu_image-video-preview_wrapper {
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100vw;
      height: 100vh;
      background-color: #000000bf;
      z-index: 9999;
      overflow: auto;
    }

    .mu_image-video-preview_wrapper2 {
      display: flex;
      height: 100%;
      width: 100%;
    }

    .mu_image-video-preview_close-button {
      position: fixed;
      top: .3em;
      right: .3em;
      cursor: pointer;
      padding: 5px;
      z-index: 9999;
      font-size: clamp(2vb, 1rem, 3vb);
    }

    .mu_image-video-preview_image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
      margin: auto;
    }

    .mu_image-video-preview_body-noscroll {
      overflow: hidden;
    }

    .mu_image-video-preview_video-size {
      max-width: 100%;
    }

    .mu_no-timmi-specified_category {
      background-color: #c44949;
    }

    .mu_no-timmi-specified_notify {
      right: 35px;
      text-align: right;
      background-color: #c44949 !important;
      border-color: #c44949;
    }
    `;

  const stylesElement = document.createElement('style');
  stylesElement.innerHTML = GLOBAL_STYLES;
  document.body.appendChild(stylesElement);

  function createSwitch(text = '', callback = () => {
  }, state = false) {
    const switchId = 'mu_' + text.replaceAll(' ', '');

    const switchContainer = document.createElement('div');
    switchContainer.classList.add('switch-container');

    const label = document.createElement('label');
    label.htmlFor = switchId;
    label.textContent = text;

    const checkbox = document.createElement('input');
    checkbox.id = switchId;
    checkbox.type = 'checkbox';
    checkbox.classList.add('switch-checkbox');
    checkbox.checked = state;

    checkbox.addEventListener('change', function(e) {
      return callback(e.target.checked);
    });

    const visualSwitch = document.createElement('label');
    visualSwitch.htmlFor = switchId;
    visualSwitch.classList.add('switch-fake-label');

    const thumb = document.createElement('span');
    thumb.classList.add('switch-thumb');

    visualSwitch.appendChild(thumb);

    switchContainer.appendChild(label);
    switchContainer.appendChild(checkbox);
    switchContainer.appendChild(visualSwitch);

    return switchContainer;
  }

  GM_registerMenuCommand('Configure', function(event) {
    const cpnl = document.getElementById('configuration-panel');
    if (cpnl) {
      cpnl.remove();
    }
    const panel = document.createElement('div');
    panel.id = 'configuration-panel';

    const panelClose = document.createElement('div');
    panelClose.textContent = '✖';
    panelClose.classList.add('panel-close');

    panelClose.addEventListener('click', function(e) {
      e.preventDefault();
      panel.remove();
    }, { once: true });

    const panelTitle = document.createElement('h1');
    panelTitle.classList.add('title');
    panelTitle.textContent = 'Mantis utilities';


    panel.appendChild(panelClose);
    panel.appendChild(panelTitle);

    panel.appendChild(createSwitch('Note privée par défaut', (v) => {
      GM_setValue('mu.private_notes', v);
      initializeModules();
    }, GM_getValue('mu.private_notes')));

    panel.appendChild(createSwitch('Bouton copier note', (v) => {
      GM_setValue('mu.copy_note', v);
      initializeModules();
    }, GM_getValue('mu.copy_note')));

    panel.appendChild(createSwitch('Prévisualisation image/video', (v) => {
      GM_setValue('mu.image_video_preview', v);
      initializeModules();
    }, GM_getValue('mu.image_video_preview')));

    const changeStateInput = document.createElement('input');
    changeStateInput.placeholder = 'ex: \'Attente validation interne\'';
    changeStateInput.style = GM_getValue('mu.change_state_input') ? '' : 'display: none';
    changeStateInput.value = GM_getValue('mu.change_state_input.value') ?? '';

    changeStateInput.addEventListener('change', function(e) {
      GM_setValue('mu.change_state_input.value', e.target.value);
      initializeModules();
    });

    panel.appendChild(createSwitch('Préselection "Changer l\'état en"', (v) => {
      changeStateInput.style = v ? '' : 'display: none';

      GM_setValue('mu.change_state_input', v);
      initializeModules();
    }, GM_getValue('mu.change_state_input')));

    panel.appendChild(changeStateInput);

    panel.appendChild(createSwitch('Alerte catégorie Timmi manquante', (v) => {
      GM_setValue('mu.no_timmi_specified', v);
      initializeModules();
    }, GM_getValue('mu.no_timmi_specified')));

    document.body.append(panel);
  });

  const destroySequence = [];

  function initializeModules() {
    if (destroySequence.length > 0) {
      for (let seq of destroySequence) {
        try {
          seq();
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (GM_getValue('mu.private_notes')) {
      try {
        initPrivateNote();
      } catch (e) {
        console.error(e);
      }
    }

    if (GM_getValue('mu.copy_note')) {
      try {
        initCopyNote();
        initCopyMantis();
      } catch (e) {
        console.error(e);
      }
    }

    if (GM_getValue('mu.image_video_preview')) {
      try {
        initImageVideoPreview();
      } catch (e) {
        console.error(e);
      }
    }

    if (GM_getValue('mu.change_state_input') && GM_getValue('mu.change_state_input.value')) {
      try {
        initChangeStateInput();
      } catch (e) {
        console.error(e);
      }
    }

    if (GM_getValue('mu.no_timmi_specified')) {
      try {
        initNoTimmiSpecified();
      } catch (e) {
        console.error(e);
      }
    }
  }

  function initPrivateNote() {
    const privateCheckbox = document.getElementById('bugnote_add_view_status');
    if (!privateCheckbox.checked) {
      privateCheckbox.click();
    }
  }

  function initCopyNote() {
    [...document.querySelectorAll('.bugnote')].forEach(bugnote => {
      bugnote.classList.add('mu_copy-note_bugnote');

      const copyButtonElement = document.createElement('a');
      copyButtonElement.classList.add('mu_copy-note_copy-button');
      copyButtonElement.textContent = '📋';

      copyButtonElement.addEventListener('click', async function(e) {
        e.preventDefault();

        const cleanedBugNoteMessageElement = bugnote.querySelector('.bugnote-note').cloneNode(true);
        [...cleanedBugNoteMessageElement.querySelectorAll('.bugnote-private')].forEach(e => {
          e.remove();
        });

        const attachmentElements = [...bugnote.querySelectorAll('.bugnote-note>.well')].map(a => {
          const dlLinkElement = [...a.querySelectorAll('a[href^=file_download]')].findLast(() => true);
          const dlLink = new URL(dlLinkElement, window.location).href;
          const dlName = dlLinkElement.textContent;
          let icon = '📄';
          if (a.querySelector('.fa-file-image-o')) {
            icon = '📸';
          }
          if (a.querySelector('.fa-file-movie-o')) {
            icon = '🎥';
          }
          if (a.querySelector('.fa-envelope-o')) {
            icon = '✉️';
          }

          const attachmentElement = document.createElement('a');
          attachmentElement.href = dlLink;
          attachmentElement.textContent = `${icon} ${dlName}`;
          return attachmentElement;
        });

        const mantisId = String(parseInt(document.querySelector('td.bug-id').textContent));
        const mantisTitle = document.querySelector('td.bug-summary').textContent.replace(/^\d+\s?:\s*/, '');
        const category = bugnote.querySelector('.category');
        const noteText = cleanedBugNoteMessageElement.textContent.trim();
        const noteLinkUrl = new URL(category.querySelector('a[rel=bookmark]').href, window.location);
        const noteLink = new URL(category.querySelector('a[rel=bookmark]').href, window.location).href;
        const noteId = noteLinkUrl.hash.slice(2);
        const user = category.querySelector('a[href*=view_user_page]');
        const userName = user.textContent.trim();
        const userLink = user.href;
        const date = category.querySelector('div:nth-child(2) > p:nth-child(2)').textContent.replaceAll(/[^0-9\s-:]/g, '').trim();

        const cbElement = document.createElement('div');

        const cbHeaderElement = document.createElement('div');

        const cbHeaderLineOne = document.createElement('div');

        cbHeaderLineOne.appendChild(document.createTextNode('📝 '));

        const cbLinkElement = document.createElement('a');
        cbLinkElement.href = noteLink;
        cbLinkElement.textContent = `Mantis ${mantisId}`;

        cbHeaderLineOne.appendChild(cbLinkElement);
        cbHeaderLineOne.appendChild(document.createTextNode(` > ${mantisTitle}`));

        const cbHeaderLineTwo = document.createElement('div');

        cbHeaderLineTwo.appendChild(document.createTextNode(`🗓️ (${date}) •  👤 `));

        const cbAuthorElement = document.createElement('a');
        cbAuthorElement.href = userLink;
        cbAuthorElement.textContent = userName;

        cbHeaderLineTwo.appendChild(cbAuthorElement);

        const separatorElement = document.createTextNode('─'.repeat(60));

        cbHeaderElement.appendChild(cbHeaderLineOne);
        cbHeaderElement.appendChild(separatorElement);
        cbHeaderElement.appendChild(cbHeaderLineTwo);
        cbHeaderElement.appendChild(separatorElement.cloneNode());

        cbElement.appendChild(cbHeaderElement);

        cbElement.appendChild(document.createElement('br'));

        const contentElement = document.createElement('div');
        contentElement.innerHTML = noteText.replaceAll(/\n/g, '<br/>');

        cbElement.appendChild(contentElement);

        cbElement.appendChild(document.createElement('br'));

        if (attachmentElements.length > 0) {
          cbElement.appendChild(document.createElement('br'));
          cbElement.appendChild(document.createTextNode('--- 📎 Attachments ---'));
        }

        attachmentElements.forEach(a => {
          const attachmentElement = document.createElement('div');
          attachmentElement.appendChild(a);
          cbElement.appendChild(attachmentElement);
        });

        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([cbElement.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([cbElement.innerText], { type: 'text/plain' })
        })]);
      });

      bugnote.appendChild(copyButtonElement);

      destroySequence.push(() => {
        bugnote.classList.remove('mu_copy-note_bugnote');
        copyButtonElement.remove();
      });
    });
  }

  function initCopyMantis() {
    const mantisHeader = document.querySelector('.widget-header');
    mantisHeader.classList.add('mu_copy-mantis_header');

    const copyButtonElement = document.createElement('a');
    copyButtonElement.classList.add('mu_copy-mantis_copy-button');
    copyButtonElement.textContent = '📋';

    copyButtonElement.addEventListener('click', async function(e) {
      e.preventDefault();

      const attachmentElements = [...document.querySelectorAll('td.bug-attach-tags>.well')].map(a => {
        const dlLinkElement = [...a.querySelectorAll('a[href^=file_download]')].findLast(() => true);
        const dlLink = new URL(dlLinkElement, window.location).href;
        const dlName = dlLinkElement.textContent;
        let icon = '📄';
        if (a.querySelector('.fa-file-image-o')) {
          icon = '📸';
        }
        if (a.querySelector('.fa-file-movie-o')) {
          icon = '🎥';
        }
        if (a.querySelector('.fa-envelope-o')) {
          icon = '✉️';
        }

        const attachmentElement = document.createElement('a');
        attachmentElement.href = dlLink;
        attachmentElement.textContent = `${icon} ${dlName}`;
        return attachmentElement;
      });

      const mantisId = String(parseInt(document.querySelector('td.bug-id').textContent));
      const mantisTitle = document.querySelector('td.bug-summary').textContent.replace(/^\d+\s?:\s*/, '');
      const author = document.querySelector('td.bug-reporter').textContent;
      const assignedTo = document.querySelector('td.bug-assigned-to').textContent;
      const status = document.querySelector('td.bug-status').textContent;
      const severity = document.querySelector('td.bug-priority').textContent;
      const bugTransversal = [...document.querySelectorAll('tr>.bug-custom-field.category')].find(f => f.textContent === 'Suspicion Bug transversal')?.parentElement.querySelector('.bug-custom-field:not(.category)').textContent;
      const description = document.querySelector('td.bug-description').innerHTML;

      const mtElement = document.createElement('div');

      const mtHeaderElement = document.createElement('div');

      const mtHeaderLineOne = document.createElement('div');

      mtHeaderLineOne.appendChild(document.createTextNode('📝 '));

      const mtLinkElement = document.createElement('a');
      mtLinkElement.href = document.location.href;
      mtLinkElement.textContent = `Mantis ${mantisId}`;

      mtHeaderLineOne.appendChild(mtLinkElement);
      mtHeaderLineOne.appendChild(document.createTextNode(` > ${mantisTitle}`));

      const mtHeaderLineTwo = document.createElement('div');

      mtHeaderLineTwo.appendChild(document.createTextNode('📊 DÉTAILS:'));

      const detailsList = document.createElement('ul');

      const authorElement = document.createElement('li');
      authorElement.textContent = ` 👤 Auteur: ${author}`;
      detailsList.appendChild(authorElement);

      const assignedToElement = document.createElement('li');
      assignedToElement.textContent = ` ➡️ Affecté à: ${assignedTo}`;
      detailsList.appendChild(assignedToElement);

      const severityElement = document.createElement('li');
      severityElement.textContent = ` 🚨 Sévérité: ${severity}`;
      detailsList.appendChild(severityElement);

      const statusElement = document.createElement('li');
      statusElement.textContent = ` 🚦 État: ${status}`;
      detailsList.appendChild(statusElement);

      const transversalElement = document.createElement('li');
      transversalElement.textContent = ` 🌐 Transversal: ${bugTransversal}`;
      detailsList.appendChild(transversalElement);

      mtHeaderLineTwo.appendChild(detailsList);


      const separatorElement = document.createTextNode('─'.repeat(60));

      mtHeaderElement.appendChild(mtHeaderLineOne);
      mtHeaderElement.appendChild(separatorElement);
      mtHeaderElement.appendChild(document.createElement('br'));
      mtHeaderElement.appendChild(mtHeaderLineTwo);
      mtHeaderElement.appendChild(separatorElement.cloneNode());
      mtElement.appendChild(mtHeaderElement);

      mtElement.appendChild(document.createElement('br'));

      const contentElement = document.createElement('div');
      contentElement.innerHTML = description;

      mtElement.appendChild(contentElement);

      if (attachmentElements.length > 0) {
        mtElement.appendChild(document.createElement('br'));
        mtElement.appendChild(document.createTextNode('--- 📎 Attachments ---'));
      }

      attachmentElements.forEach(a => {
        const attachmentElement = document.createElement('div');
        attachmentElement.appendChild(a);
        mtElement.appendChild(attachmentElement);
      });

      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([mtElement.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([mtElement.innerText], { type: 'text/plain' })
      })]);
    });

    mantisHeader.appendChild(copyButtonElement);

    destroySequence.push(() => {
      mantisHeader.classList.remove('mu_copy-mantis_header');
      copyButtonElement.remove();
    });
  }

  function initImageVideoPreview() {
    [...document.querySelectorAll('.bug-attachment-preview-image:has(a[href^=file_download]):has(img)')].forEach(prevEl => {
      const elLnk = [...prevEl.parentElement.querySelectorAll('a[href^=file_download]')].find(el => el.textContent);
      const imgName = elLnk.textContent;
      prevEl.querySelector('a[href^=file_download]:has(img)').addEventListener('click', function(e) {
        e.preventDefault();

        [...document.querySelectorAll('.mu_image-video-preview_wrapper')].forEach(p => p.remove());

        const previewElement = document.createElement('div');
        previewElement.classList.add('mu_image-video-preview_wrapper');

        const closeButton = document.createElement('div');
        closeButton.classList.add('mu_image-video-preview_close-button');
        closeButton.textContent = '❌';

        const previewElement2 = document.createElement('div');
        previewElement2.classList.add('mu_image-video-preview_wrapper2');

        const imagePreview = document.createElement('img');
        imagePreview.classList.add('mu_image-video-preview_image');
        imagePreview.src = elLnk.href;

        previewElement2.appendChild(imagePreview);

        previewElement.appendChild(closeButton);
        previewElement.appendChild(previewElement2);

        let keyDownEvent = () => {
        };

        function close() {
          try {
            document.body.classList.remove('mu_image-video-preview_body-noscroll');
            previewElement.remove();
            document.removeEventListener('keydown', keyDownEvent);
          } catch (e) {
            console.error(e);
          }
        }

        closeButton.addEventListener('click', close);
        previewElement.addEventListener('click', close);
        imagePreview.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
        });

        document.body.appendChild(previewElement);
        document.body.classList.add('mu_image-video-preview_body-noscroll');

        document.addEventListener('keydown', keyDownEvent = (event) => {
          if (event.key === 'Escape') {
            close();
          }
        });

        let zoomLevel = 1;
        const minZoomLevel = 1;
        const maxZoomLevel = 20;
        const zoomFactorStep = 1;

        function setZoom(newZoom, mouseX = null, mouseY = null) {
          newZoom = Math.min(Math.max(minZoomLevel, newZoom), maxZoomLevel);

          if (newZoom === zoomLevel) {
            return;
          }

          const scrollLeft = previewElement.scrollLeft;
          const scrollTop = previewElement.scrollTop;
          const clientWidth = previewElement.clientWidth;
          const clientHeight = previewElement.clientHeight;

          let contentFocalX, contentFocalY;

          if (mouseX !== null && mouseY !== null) {
            contentFocalX = mouseX + scrollLeft;
            contentFocalY = mouseY + scrollTop;
          } else {
            contentFocalX = scrollLeft + clientWidth / 2;
            contentFocalY = scrollTop + clientHeight / 2;
          }

          const oldContentWidth = previewElement2.offsetWidth;
          const oldContentHeight = previewElement2.offsetHeight;

          const relativeX = contentFocalX / oldContentWidth;
          const relativeY = contentFocalY / oldContentHeight;

          zoomLevel = newZoom;

          const newSizePercentage = 80 + zoomLevel * 20;
          previewElement2.style.width = `${newSizePercentage}%`;
          previewElement2.style.height = `${newSizePercentage}%`;

          requestAnimationFrame(() => {
            const newContentWidth = previewElement2.offsetWidth;
            const newContentHeight = previewElement2.offsetHeight;

            const newContentFocalX = relativeX * newContentWidth;
            const newContentFocalY = relativeY * newContentHeight;

            let newScrollLeft, newScrollTop;

            if (mouseX !== null && mouseY !== null) {
              newScrollLeft = newContentFocalX - mouseX;
              newScrollTop = newContentFocalY - mouseY;
            } else {
              newScrollLeft = newContentFocalX - clientWidth / 2;
              newScrollTop = newContentFocalY - clientHeight / 2;
            }

            newScrollLeft = Math.max(
              0,
              Math.min(newScrollLeft, newContentWidth - clientWidth)
            );
            newScrollTop = Math.max(
              0,
              Math.min(newScrollTop, newContentHeight - clientHeight)
            );

            previewElement.scrollTo({
              left: newScrollLeft,
              top: newScrollTop
            });
          });
        }


        const wheelEvent = (event) => {
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();

            let newZoom = zoomLevel;

            if (event.deltaY < 0) {
              newZoom += zoomFactorStep;
            } else {
              newZoom -= zoomFactorStep;
            }

            const mouseX = event.clientX - previewElement.getBoundingClientRect().left;
            const mouseY = event.clientY - previewElement.getBoundingClientRect().top;

            setZoom(newZoom, mouseX, mouseY);
          }
        };

        previewElement.addEventListener('wheel', wheelEvent, { passive: false });

        destroySequence.push(() => {
          previewElement.remove();
        });
      });

      const subElement = document.createElement('div');
      const downloadButton = document.createElement('a');
      downloadButton.href = elLnk.href;
      downloadButton.download = imgName;
      downloadButton.textContent = '💾 Télécharger';

      subElement.appendChild(downloadButton);

      prevEl.appendChild(subElement);

      destroySequence.push(() => {
        document.body.classList.remove('mu_image-video-preview_body-noscroll');
        subElement.remove();
      });
    });

    [...document.querySelectorAll('.bug-attachment-preview-video>a[href^=file_download]>video')].forEach(el => {
      el.classList.add('mu_image-video-preview_video-size');
      destroySequence.push(() => {
        el.classList.remove('mu_image-video-preview_video-size');
      });
    });
  }

  function initChangeStateInput() {
    const selectElement = document.querySelector('select[name=new_status]');

    const options = [...selectElement.querySelectorAll('option')];

    const selOpt = options.find(o => o.textContent === GM_getValue('mu.change_state_input.value'));
    if (selOpt) {
      options.filter(o => o.selected).forEach(o => {
        o.selected = false;
      });

      selectElement.value = selOpt.value;
      selOpt.selected = true;
    }
  }

  function initNoTimmiSpecified() {
    const timmiCategoryElement = [...document.querySelectorAll('tr>.bug-custom-field.category')].find(f => f.textContent === 'Rubrique Timmi')?.parentElement.querySelector('.bug-custom-field:not(.category)');
    const timmiCategory = timmiCategoryElement?.textContent;
    if (timmiCategory === '') {
      timmiCategoryElement.classList.add('mu_no-timmi-specified_category');

      const notifElement = document.createElement('div');
      notifElement.classList.add('btn-scroll-up');
      notifElement.classList.add('btn');
      notifElement.classList.add('btn-sm');
      notifElement.classList.add('display');
      notifElement.classList.add('mu_no-timmi-specified_notify');

      notifElement.textContent = 'Aucune catégorie Timmi n\'est spécifiée pour ce Mantis!';

      document.getElementById('main-container').appendChild(notifElement);

      destroySequence.push(() => {
        timmiCategoryElement.classList.remove('mu_no-timmi-specified_category');
        notifElement.remove();
      });
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(new Error(`FileReader error: ${error.target.error.code}`));
      };
      reader.readAsDataURL(blob);
    });
  }

  if (!GM_getValue('mu.FIRST_INSTALL')) {
    GM_setValue('mu.copy_note', true);
    GM_setValue('mu.image_video_preview', true);

    GM_setValue('mu.FIRST_INSTALL', true);
  }

  initializeModules();

})();
