// ==UserScript==
// @name         Mantis utilities
// @namespace    https://bug.leaderinfo.com/mantisbt
// @version      2026-06-12_15-09
// @description  Liste d'utilitaires pour améliorer l'utilisation de mantis
// @author       lhubert
// @downloadURL  https://github.com/antenia-lhubert/Mantis-utilities/raw/refs/heads/main/Mantis%20utilities.user.js
// @updateURL    https://github.com/antenia-lhubert/Mantis-utilities/raw/refs/heads/main/Mantis%20utilities.user.js
// @match        https://bug.leaderinfo.com/mantisbt/view.php*
// @match        https://bug.leaderinfo.com/mantisbt/bug_report_page.php*
// @match        https://bug.leaderinfo.com/mantisbt/bug_report.php*
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

    .mu_report-form-backup_banner {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 1000000;
      background: rgb(22, 22, 31);
      color: rgb(240, 240, 242);
      border: 1px solid rgb(85, 143, 241);
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, .35);
      max-width: 420px;
      font-size: 14px;
    }

    .mu_report-form-backup_banner-title {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .mu_report-form-backup_banner-text {
      margin-bottom: 10px;
    }

    .mu_report-form-backup_banner button {
      color: black;
      cursor: pointer;
      margin-right: 8px;
    }

    .mu_username-autocomplete_popup {
      position: absolute;
      z-index: 1000001;
      min-width: 220px;
      max-width: min(420px, calc(100vw - 20px));
      max-height: 260px;
      overflow-y: auto;
      background: #fff;
      color: #333;
      border: 1px solid #558ff1;
      border-radius: 4px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, .25);
      padding: 4px 0;
      font-size: 13px;
    }

    .mu_username-autocomplete_item {
      padding: 6px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mu_username-autocomplete_item:hover,
    .mu_username-autocomplete_item-active {
      background: rgb(85, 143, 241);
      color: #fff;
    }

    .mu_username-autocomplete_username {
      font-weight: bold;
    }

    .mu_username-autocomplete_realname {
      font-size: .9em;
      opacity: .85;
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

    panel.appendChild(createSwitch('Sauvegarde formulaire rapport', (v) => {
      GM_setValue('mu.report_form_backup', v);
      initializeModules();
    }, GM_getValue('mu.report_form_backup')));

    panel.appendChild(createSwitch('Auto-complétion @utilisateur', (v) => {
      GM_setValue('mu.username_autocomplete', v);
      initializeModules();
    }, GM_getValue('mu.username_autocomplete')));

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

    if (GM_getValue('mu.report_form_backup')) {
      try {
        initReportFormBackup();
      } catch (e) {
        console.error(e);
      }
    }

    if (GM_getValue('mu.username_autocomplete')) {
      try {
        initUsernameAutocomplete();
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
    if (!privateCheckbox) {
      return;
    }

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
    if (!mantisHeader || !document.querySelector('td.bug-id')) {
      return;
    }

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
    if (!selectElement) {
      return;
    }

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
    if (!timmiCategoryElement) {
      return;
    }

    const timmiCategory = timmiCategoryElement.textContent;
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


  function initUsernameAutocomplete() {
    const MAX_RESULTS = 8;
    const TARGET_SELECTOR = 'textarea, input[type="text"]:not(.nav-search-input), input[type="search"]';
    let popupElement = null;
    let activeInput = null;
    let activeMention = null;
    let activeIndex = 0;
    let activeResults = [];

    function normalizeText(value) {
      return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    }

    function parseUserLabel(label) {
      const text = label.trim().replace(/\s+/g, ' ');
      const match = text.match(/^(.+?)\s*\(@?([^()\s]+)\)$/);
      if (match) {
        return { username: match[2], realName: match[1] };
      }
      return { username: text.replace(/^@+/, ''), realName: '' };
    }

    function getUsers() {
      const usersByUsername = new Map();

      function addUser(username, realName = '') {
        username = username.trim().replace(/^@+/, '');
        realName = realName.trim();
        if (!username || username === 'Aucune' || username.startsWith('[')) {
          return;
        }

        const key = normalizeText(username);
        const existing = usersByUsername.get(key);
        if (!existing || (!existing.realName && realName)) {
          usersByUsername.set(key, { username, realName });
        }
      }

      [...document.querySelectorAll('select[name="handler_id"] option, select[name="user_id"] option, select[name="reporter_id"] option, select[name="monitor_user_id"] option')].forEach(option => {
        const parsed = parseUserLabel(option.textContent || '');
        addUser(parsed.username, parsed.realName);
      });

      [...document.querySelectorAll('a[href*="view_user_page.php?id="]')].forEach(link => {
        const parsed = parseUserLabel(link.textContent || '');
        addUser(parsed.username, parsed.realName);
      });

      const currentUsername = document.querySelector('.user-info')?.textContent?.trim();
      if (currentUsername) {
        addUser(currentUsername);
      }

      return [...usersByUsername.values()].sort((a, b) => a.username.localeCompare(b.username));
    }

    const users = getUsers();
    if (users.length === 0) {
      return;
    }

    function fuzzyScore(candidate, query) {
      const q = normalizeText(query).trim();
      if (!q) {
        return 0;
      }

      const username = normalizeText(candidate.username);
      const realName = normalizeText(candidate.realName);
      const haystack = `${username} ${realName}`.trim();
      const tokens = haystack.split(/[^a-z0-9]+/).filter(Boolean);

      if (username === q) {
        return -20;
      }
      if (username.startsWith(q)) {
        return -10 + username.length - q.length;
      }
      if (tokens.some(token => token.startsWith(q))) {
        return -5;
      }
      if (haystack.includes(q)) {
        return 5 + haystack.indexOf(q);
      }

      let pos = -1;
      let gaps = 0;
      for (const char of q) {
        const nextPos = haystack.indexOf(char, pos + 1);
        if (nextPos === -1) {
          return Infinity;
        }
        if (pos !== -1) {
          gaps += nextPos - pos - 1;
        }
        pos = nextPos;
      }

      return 20 + gaps + haystack.length * 0.01;
    }

    function searchUsers(query) {
      return users
        .map(user => ({ user, score: fuzzyScore(user, query) }))
        .filter(result => Number.isFinite(result.score))
        .sort((a, b) => a.score - b.score || a.user.username.localeCompare(b.user.username))
        .slice(0, MAX_RESULTS)
        .map(result => result.user);
    }

    function isUsernameInput(input) {
      const name = input.getAttribute('name') || '';
      const id = input.id || '';
      const autocomplete = input.getAttribute('autocomplete') || '';
      const ariaLabel = input.getAttribute('aria-label') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      const haystack = `${name} ${id} ${autocomplete} ${ariaLabel} ${placeholder}`.toLowerCase();

      return input.tagName !== 'TEXTAREA' && (
        id === 'bug_monitor_list_user_to_add'
        || name === 'user_to_add'
        || haystack.includes('username')
        || haystack.includes('user_to_add')
        || haystack.includes('monitor_user')
      );
    }

    function findAutocompleteQuery(input) {
      const cursor = input.selectionStart;
      if (cursor === null || cursor !== input.selectionEnd) {
        return null;
      }

      if (isUsernameInput(input)) {
        const value = input.value;
        // Username fields expect a single username, so autocomplete the whole value
        // without requiring or inserting an '@'.
        if (!value.trim() || /[\s,;:!?<>()[\]{}]/.test(value)) {
          return null;
        }

        return {
          start: 0,
          end: value.length,
          query: value,
          prefix: '',
          suffix: ''
        };
      }

      const textBeforeCursor = input.value.slice(0, cursor);
      const match = textBeforeCursor.match(/(^|[\s([{>])@([^@\r\n]{0,40})$/);
      if (!match) {
        return null;
      }

      const query = match[2];
      if (/^[\s]/.test(query) || /[,;:!?<>()[\]{}]/.test(query)) {
        return null;
      }

      return {
        start: cursor - query.length - 1,
        end: cursor,
        query,
        prefix: '@',
        suffix: ' '
      };
    }

    function getCaretPosition(input) {
      const rect = input.getBoundingClientRect();
      const computed = window.getComputedStyle(input);
      const cursor = input.selectionStart ?? 0;
      const marker = document.createElement('span');
      const mirror = document.createElement('div');
      const propertiesToCopy = [
        'boxSizing', 'width', 'height', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
        'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent', 'lineHeight',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'
      ];

      propertiesToCopy.forEach(property => {
        mirror.style[property] = computed[property];
      });

      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.left = `${window.scrollX + rect.left}px`;
      mirror.style.top = `${window.scrollY + rect.top}px`;
      mirror.style.overflow = 'hidden';
      mirror.style.whiteSpace = input.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre';
      mirror.style.wordWrap = input.tagName === 'TEXTAREA' ? 'break-word' : 'normal';

      // A trailing newline would otherwise collapse in the mirror and place the marker
      // on the previous line instead of the current empty line.
      mirror.textContent = input.value.slice(0, cursor).replace(/\n$/g, '\n\u200b');
      marker.textContent = '\u200b';
      mirror.appendChild(marker);
      document.body.appendChild(mirror);

      const markerRect = marker.getBoundingClientRect();
      const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2 || 16;
      const position = {
        left: window.scrollX + markerRect.left - input.scrollLeft,
        top: window.scrollY + markerRect.top - input.scrollTop + lineHeight + 4
      };

      mirror.remove();
      return position;
    }

    function positionPopup(input) {
      if (!popupElement) {
        return;
      }

      const rect = input.getBoundingClientRect();
      const popupWidth = Math.max(220, Math.min(rect.width, 420));
      const caretPosition = getCaretPosition(input);
      const maxLeft = window.scrollX + document.documentElement.clientWidth - popupWidth - 10;
      const left = Math.max(window.scrollX + 10, Math.min(caretPosition.left, maxLeft));

      popupElement.style.top = `${caretPosition.top}px`;
      popupElement.style.left = `${left}px`;
      popupElement.style.width = `${popupWidth}px`;
    }

    function closePopup() {
      popupElement?.remove();
      popupElement = null;
      activeInput = null;
      activeMention = null;
      activeResults = [];
      activeIndex = 0;
    }

    function renderPopup(input, mention, results) {
      closePopup();
      if (results.length === 0) {
        return;
      }

      activeInput = input;
      activeMention = mention;
      activeResults = results;
      activeIndex = 0;

      popupElement = document.createElement('div');
      popupElement.classList.add('mu_username-autocomplete_popup');

      results.forEach((user, index) => {
        const item = document.createElement('div');
        item.classList.add('mu_username-autocomplete_item');
        if (index === activeIndex) {
          item.classList.add('mu_username-autocomplete_item-active');
        }

        const username = document.createElement('span');
        username.classList.add('mu_username-autocomplete_username');
        username.textContent = `${mention.prefix}${user.username}`;
        item.appendChild(username);

        if (user.realName) {
          const realName = document.createElement('span');
          realName.classList.add('mu_username-autocomplete_realname');
          realName.textContent = user.realName;
          item.appendChild(realName);
        }

        item.addEventListener('mousedown', function(e) {
          e.preventDefault();
          selectUser(index);
        });

        popupElement.appendChild(item);
      });

      document.body.appendChild(popupElement);
      positionPopup(input);
    }

    function refreshActiveItem() {
      if (!popupElement) {
        return;
      }
      [...popupElement.querySelectorAll('.mu_username-autocomplete_item')].forEach((item, index) => {
        item.classList.toggle('mu_username-autocomplete_item-active', index === activeIndex);
      });
      popupElement.querySelector('.mu_username-autocomplete_item-active')?.scrollIntoView({ block: 'nearest' });
    }

    function selectUser(index = activeIndex) {
      if (!activeInput || !activeMention || !activeResults[index]) {
        return;
      }

      const user = activeResults[index];
      const before = activeInput.value.slice(0, activeMention.start);
      const after = activeInput.value.slice(activeMention.end);
      const insertion = `${activeMention.prefix}${user.username}${activeMention.suffix}`;
      const cursor = before.length + insertion.length;

      activeInput.value = `${before}${insertion}${after}`;
      activeInput.setSelectionRange(cursor, cursor);
      activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      closePopup();
    }

    function update(input) {
      const mention = findAutocompleteQuery(input);
      if (!mention) {
        closePopup();
        return;
      }

      const results = searchUsers(mention.query);
      renderPopup(input, mention, results);
    }

    function onInput(e) {
      update(e.target);
    }

    function onKeyDown(e) {
      if (!popupElement || e.target !== activeInput) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % activeResults.length;
        refreshActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + activeResults.length) % activeResults.length;
        refreshActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectUser();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePopup();
      }
    }

    function onBlur() {
      setTimeout(closePopup, 150);
    }

    function onScrollOrResize() {
      if (activeInput) {
        positionPopup(activeInput);
      }
    }

    const inputs = [...document.querySelectorAll(TARGET_SELECTOR)]
      .filter(input => !input.readOnly && !input.disabled);

    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.addEventListener('input', onInput);
      input.addEventListener('keydown', onKeyDown);
      input.addEventListener('blur', onBlur);
      input.addEventListener('click', onInput);
    });

    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    destroySequence.push(() => {
      closePopup();
      inputs.forEach(input => {
        input.removeEventListener('input', onInput);
        input.removeEventListener('keydown', onKeyDown);
        input.removeEventListener('blur', onBlur);
        input.removeEventListener('click', onInput);
      });
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    });
  }


  function initReportFormBackup() {
    const STORAGE_KEY = 'mu.report_form_backup.data';
    const STORAGE_TS_KEY = 'mu.report_form_backup.timestamp';
    const STORAGE_URL_KEY = 'mu.report_form_backup.url';
    const RESTORE_PENDING_KEY = 'mu.report_form_backup.restore_pending';

    const isReportPage = location.pathname.endsWith('/bug_report_page.php');
    const isReportSubmitPage = location.pathname.endsWith('/bug_report.php');

    function getReportForm() {
      return document.querySelector('form[action*="bug_report.php"]');
    }

    function isRestorableField(field) {
      if (!field.name || field.disabled) {
        return false;
      }

      if (field.type === 'file') {
        return false;
      }

      if (['submit', 'button', 'reset', 'image'].includes(field.type)) {
        return false;
      }

      return true;
    }

    function serializeForm(form) {
      const data = {};

      [...form.elements].forEach(field => {
        if (!isRestorableField(field)) {
          return;
        }

        if (field.type === 'checkbox') {
          data[field.name] ??= [];
          if (field.checked) {
            data[field.name].push(field.value);
          }
          return;
        }

        if (field.type === 'radio') {
          if (field.checked) {
            data[field.name] = field.value;
          }
          return;
        }

        if (field.tagName === 'SELECT' && field.multiple) {
          data[field.name] = [...field.selectedOptions].map(o => o.value);
          return;
        }

        data[field.name] = field.value;
      });

      return data;
    }

    function restoreForm(form, data) {
      if (!data || typeof data !== 'object') {
        return;
      }

      [...form.elements].forEach(field => {
        if (!isRestorableField(field) || !(field.name in data)) {
          return;
        }

        const value = data[field.name];

        if (field.type === 'checkbox') {
          field.checked = Array.isArray(value) && value.includes(field.value);
          field.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }

        if (field.type === 'radio') {
          field.checked = value === field.value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }

        if (field.tagName === 'SELECT' && field.multiple) {
          [...field.options].forEach(option => {
            option.selected = Array.isArray(value) && value.includes(option.value);
          });
          field.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }

        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    function saveCurrentForm() {
      const form = getReportForm();
      if (!form) {
        return;
      }

      GM_setValue(STORAGE_KEY, serializeForm(form));
      GM_setValue(STORAGE_TS_KEY, Date.now());
      GM_setValue(STORAGE_URL_KEY, location.href);
    }

    function clearBackup() {
      GM_deleteValue(STORAGE_KEY);
      GM_deleteValue(STORAGE_TS_KEY);
      GM_deleteValue(STORAGE_URL_KEY);
      GM_deleteValue(RESTORE_PENDING_KEY);
    }

    function getBackup() {
      const data = GM_getValue(STORAGE_KEY);
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        return null;
      }
      return data;
    }

    function getBackupTitle(backup) {
      if (!backup || typeof backup !== 'object') {
        return 'Sans titre';
      }

      const summaryKey = Object.keys(backup).find(k => k.toLowerCase() === 'summary')
        ?? Object.keys(backup).find(k => k.toLowerCase().includes('summary'));
      const summary = summaryKey ? backup[summaryKey] : '';

      if (typeof summary === 'string' && summary.trim()) {
        return summary.trim();
      }

      return 'Sans titre';
    }

    function goToReportPage() {
      location.href = GM_getValue(STORAGE_URL_KEY) || new URL('bug_report_page.php', location.href).href;
    }

    function addRestoreBanner() {
      const backup = getBackup();
      if (!backup || document.getElementById('mu-report-form-backup-banner')) {
        return;
      }

      const banner = document.createElement('div');
      banner.id = 'mu-report-form-backup-banner';
      banner.classList.add('mu_report-form-backup_banner');

      const timestamp = GM_getValue(STORAGE_TS_KEY);
      const dateText = timestamp ? new Date(timestamp).toLocaleString() : 'date inconnue';
      const reportTitle = getBackupTitle(backup);

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.textContent = '✖';
      closeButton.title = 'Fermer sans supprimer le brouillon';
      closeButton.style = 'position: absolute; top: 6px; right: 6px; margin: 0;';
      closeButton.addEventListener('click', function() {
        banner.remove();
      });

      const title = document.createElement('div');
      title.classList.add('mu_report-form-backup_banner-title');
      title.style.paddingRight = '24px';
      title.textContent = '🛟 Brouillon Mantis sauvegardé';

      const text = document.createElement('div');
      text.classList.add('mu_report-form-backup_banner-text');
      text.textContent = `« ${reportTitle} » — sauvegardé le ${dateText}.`;

      const restoreButton = document.createElement('button');
      restoreButton.type = 'button';
      restoreButton.textContent = 'Restaurer';
      restoreButton.addEventListener('click', function() {
        const form = getReportForm();
        if (!form) {
          GM_setValue(RESTORE_PENDING_KEY, true);
          goToReportPage();
          return;
        }

        restoreForm(form, backup);
        GM_deleteValue(RESTORE_PENDING_KEY);
        banner.remove();
      });

      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.textContent = 'Retour au formulaire';
      backButton.title = 'Retourner au formulaire sans restaurer automatiquement';
      backButton.addEventListener('click', goToReportPage);

      const discardButton = document.createElement('button');
      discardButton.type = 'button';
      discardButton.textContent = 'Supprimer';
      discardButton.addEventListener('click', function() {
        clearBackup();
        banner.remove();
      });

      banner.appendChild(closeButton);
      banner.appendChild(title);
      banner.appendChild(text);
      banner.appendChild(restoreButton);
      if (!isReportPage) {
        banner.appendChild(backButton);
      }
      banner.appendChild(discardButton);

      document.body.appendChild(banner);

      destroySequence.push(() => {
        banner.remove();
      });
    }

    if (isReportPage) {
      const form = getReportForm();
      if (!form) {
        return;
      }

      const backup = getBackup();
      const shouldRestore = GM_getValue(RESTORE_PENDING_KEY);

      // Never restore just because a draft exists. Restore only after the user clicked
      // "Restaurer" from bug_report.php, or directly clicks "Restaurer" on this page.
      if (backup && shouldRestore) {
        restoreForm(form, backup);
        GM_deleteValue(RESTORE_PENDING_KEY);
      }

      if (backup) {
        addRestoreBanner();
      }

      const saveHandler = () => saveCurrentForm();

      form.addEventListener('input', saveHandler);
      form.addEventListener('change', saveHandler);
      form.addEventListener('submit', saveCurrentForm);

      destroySequence.push(() => {
        form.removeEventListener('input', saveHandler);
        form.removeEventListener('change', saveHandler);
        form.removeEventListener('submit', saveCurrentForm);
      });
    }

    if (isReportSubmitPage) {
      addRestoreBanner();
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

  if (GM_getValue('mu.copy_note') === undefined) {
    GM_setValue('mu.copy_note', true);
  }
  if (GM_getValue('mu.image_video_preview') === undefined) {
    GM_setValue('mu.image_video_preview', true);
  }
  if (GM_getValue('mu.report_form_backup') === undefined) {
    GM_setValue('mu.report_form_backup', true);
  }
  if (GM_getValue('mu.username_autocomplete') === undefined) {
    GM_setValue('mu.username_autocomplete', true);
  }

  initializeModules();

})();
