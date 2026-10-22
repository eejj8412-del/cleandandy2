(() => {
  const source = document.currentScript;
  const brand = source?.dataset.brand?.trim();
  const phone = source?.dataset.phone?.replace(/\D/g, '');
  if (/^\/consult\/?$/.test(location.pathname)) return;
  const accent = /^#[\da-fA-F]{6}$/.test(source?.dataset.accent || '') ? source.dataset.accent : '#f5c400';
  const accentRgb = [1, 3, 5].map(index => parseInt(accent.slice(index, index + 2), 16));
  const accentInk = (accentRgb[0] * 299 + accentRgb[1] * 587 + accentRgb[2] * 114) / 1000 < 145 ? '#fff' : '#181712';
  if (!brand || !/^010\d{8}$/.test(phone)) return;

  const style = document.createElement('style');
  style.textContent = `
    .hf-chat-launch{position:fixed;right:18px;bottom:86px;z-index:9998;min-height:54px;padding:12px 19px;border:0;border-radius:999px;background:#181712;color:#fff;box-shadow:0 10px 28px #0004;font:800 15px/1.3 system-ui,"Noto Sans KR",sans-serif;cursor:pointer}
    .hf-chat-launch:hover,.hf-chat-launch:focus-visible{background:#353126;outline:3px solid var(--hf-accent)}
    .hf-chat-dialog{width:min(460px,calc(100vw - 24px));max-height:min(700px,calc(100dvh - 36px));padding:0;border:0;border-radius:20px;color:#191919;background:#fff;box-shadow:0 22px 70px #0005;font:15px/1.55 system-ui,"Noto Sans KR",sans-serif}
    .hf-chat-dialog::backdrop{background:#0009}
    .hf-chat-header{display:flex;align-items:start;justify-content:space-between;gap:12px;padding:20px 22px;background:#181712;color:#fff}
    .hf-chat-header strong{display:block;font-size:18px}
    .hf-chat-header small{display:block;margin-top:3px;color:#e9d87b}
    .hf-chat-close{width:38px;height:38px;flex:none;border:1px solid #777;border-radius:50%;background:transparent;color:#fff;font-size:23px;line-height:1;cursor:pointer}
    .hf-chat-body{padding:22px}
    .hf-chat-progress{margin:0 0 16px;color:#705517;font-size:13px;font-weight:800}
    .hf-chat-question{margin:0 0 8px;font-size:20px;font-weight:850;line-height:1.4}
    .hf-chat-hint{margin:0 0 17px;color:#5e5a51;font-size:14px}
    .hf-chat-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .hf-chat-choice{min-height:49px;padding:9px 11px;border:2px solid #e4dfd2;border-radius:11px;background:#fff;color:#191919;text-align:left;font:inherit;font-size:14px;font-weight:800;line-height:1.35;cursor:pointer}
    .hf-chat-choice:hover,.hf-chat-choice:focus-visible{border-color:var(--hf-accent);background:#fff9dd}
    .hf-chat-label{display:block;margin:17px 0 7px;font-weight:800}
    .hf-chat-input,.hf-chat-summary{display:block;width:100%;box-sizing:border-box;padding:12px;border:2px solid #d7d2c5;border-radius:10px;background:#fff;color:#191919;font:inherit;resize:vertical}
    .hf-chat-input:focus,.hf-chat-summary:focus{outline:3px solid #ffe06a}
    .hf-chat-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}
    .hf-chat-action{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 16px;border:0;border-radius:10px;background:var(--hf-accent);color:var(--hf-accent-ink);text-decoration:none;font:850 14px/1.3 system-ui,"Noto Sans KR",sans-serif;cursor:pointer}
    .hf-chat-action-secondary{background:#eee9dc}
    .hf-chat-note,.hf-chat-error{margin:12px 0 0;font-size:13px}
    .hf-chat-note{color:#5e5a51}.hf-chat-error{color:#a51d1d}
    @media(max-width:620px){.hf-chat-launch{right:12px;bottom:79px}.hf-chat-dialog{max-height:calc(100dvh - 22px)}.hf-chat-choices{grid-template-columns:1fr}.hf-chat-body{padding:18px}}
  `;
  document.head.append(style);

  const launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'hf-chat-launch';
  launch.style.setProperty('--hf-accent', accent);
  launch.style.setProperty('--hf-accent-ink', accentInk);
  launch.textContent = '사진 문자 상담';
  launch.setAttribute('aria-label', `${brand} 사진 문자 상담 도우미 열기`);

  const dialog = document.createElement('dialog');
  dialog.className = 'hf-chat-dialog';
  dialog.style.setProperty('--hf-accent', accent);
  dialog.style.setProperty('--hf-accent-ink', accentInk);
  dialog.setAttribute('aria-label', `${brand} 사진 문자 상담 도우미`);
  dialog.innerHTML = '<div class="hf-chat-header"><div><strong></strong><small>사진 문자 상담 도우미</small></div><button class="hf-chat-close" type="button" aria-label="닫기">×</button></div><div class="hf-chat-body"><p class="hf-chat-progress"></p><div class="hf-chat-content"></div><div class="hf-chat-actions"></div><p class="hf-chat-note">입력 내용은 이 화면에서 문자 초안을 만드는 데만 사용합니다. 문자 앱에서 사진을 첨부하고 직접 전송해 주세요.</p></div>';
  dialog.querySelector('strong').textContent = brand;
  document.body.append(launch, dialog);

  const content = dialog.querySelector('.hf-chat-content');
  const actions = dialog.querySelector('.hf-chat-actions');
  const progress = dialog.querySelector('.hf-chat-progress');
  const state = { service:'', detail:'', region:'', timing:'' };
  const services = ['타일', '강마루·바닥', '벽·천장', '문틀·몰딩·걸레받이', '천연대리석', '가구·싱크장', '샤시', '기타·잘 모르겠어요'];
  let step = 0;

  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const addButton = (label, className, action) => {
    const node = make('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  const heading = (question, hint) => {
    content.append(make('p','hf-chat-question',question),make('p','hf-chat-hint',hint));
  };
  const textStep = (key, question, hint, placeholder, maxLength) => {
    heading(question,hint);
    const label = make('label','hf-chat-label',key === 'detail' ? '손상 상태' : key === 'region' ? '지역' : '희망 시기');
    const input = document.createElement(key === 'detail' ? 'textarea' : 'input');
    input.className = 'hf-chat-input';
    input.id = `hf-chat-${key}`;
    input.placeholder = placeholder;
    input.maxLength = maxLength;
    input.value = state[key];
    if (input.tagName === 'TEXTAREA') input.rows = 3;
    label.htmlFor = input.id;
    const error = make('p','hf-chat-error');
    error.setAttribute('role','alert');
    content.append(label,input,error);
    actions.append(addButton('이전','hf-chat-action hf-chat-action-secondary',()=>{step--;render();}));
    actions.append(addButton('다음','hf-chat-action',()=>{
      const value = input.value.trim();
      if (!value) { error.textContent = '내용을 입력해 주세요.'; input.focus(); return; }
      state[key] = value;
      step++;
      render();
    }));
    input.focus();
  };
  const render = () => {
    content.replaceChildren();
    actions.replaceChildren();
    progress.textContent = step < 4 ? `${step + 1} / 4` : '상담 내용 완성';
    if (step === 0) {
      heading('어떤 곳을 수리하고 싶으세요?','정확한 소재를 몰라도 괜찮습니다.');
      const group = make('div','hf-chat-choices');
      services.forEach(service=>group.append(addButton(service,'hf-chat-choice',()=>{
        state.service = service;
        step = 1;
        render();
      })));
      content.append(group);
      group.querySelector('button')?.focus();
    } else if (step === 1) {
      textStep('detail','어떤 손상이 생겼나요?','위치·크기·개수를 알면 함께 적어주세요.','예: 문틀 아래쪽이 찍혔어요.',300);
    } else if (step === 2) {
      textStep('region','어느 지역인가요?','상세 주소 대신 시·구 또는 시·군만 적어도 됩니다.','예: 서울 강서구',80);
    } else if (step === 3) {
      textStep('timing','언제쯤 수리를 원하시나요?','가능한 시기를 편하게 적어주세요.','예: 이번 주 / 일정 조율 가능',80);
    } else {
      heading('문자 내용을 준비했어요.','현장 사진을 본 뒤 복원 가능 여부와 범위를 안내합니다. 이 화면에서 견적을 확정하지 않습니다.');
      const message = `[${brand} 사진 상담]\n수리 분야: ${state.service}\n손상 상태: ${state.detail}\n지역: ${state.region}\n희망 시기: ${state.timing}\n\n전체 사진과 손상 부위 근접 사진을 첨부합니다.`;
      const label = make('label','hf-chat-label','보낼 문자 내용');
      const summary = make('textarea','hf-chat-summary');
      summary.id = 'hf-chat-summary';
      summary.rows = 8;
      summary.readOnly = true;
      summary.value = message;
      label.htmlFor = summary.id;
      content.append(label,summary);
      const status = make('p','hf-chat-note');
      status.setAttribute('role','status');
      actions.append(addButton('내용 복사','hf-chat-action hf-chat-action-secondary',async()=>{
        try { await navigator.clipboard.writeText(message); status.textContent = '복사했습니다. 문자 앱에서 붙여넣고 사진을 첨부해 주세요.'; }
        catch { summary.select(); status.textContent = '자동 복사가 안 되면 내용을 길게 눌러 복사해 주세요.'; }
      }));
      const sms = make('a','hf-chat-action','문자 앱 열기');
      sms.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
      sms.addEventListener('click',()=>{status.textContent='문자 앱에 내용이 비어 있으면 복사해서 붙여넣어 주세요. 사진 첨부 후 직접 전송해야 상담이 접수됩니다.';});
      actions.append(sms);
      actions.append(addButton('처음부터','hf-chat-action hf-chat-action-secondary',()=>{
        Object.keys(state).forEach(key=>{state[key]='';});
        step=0;render();
      }));
      content.append(status);
    }
  };
  const openDialog = () => { dialog.showModal(); render(); };
  launch.addEventListener('click',openDialog);
  dialog.querySelector('.hf-chat-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>launch.focus());
  if (new URLSearchParams(location.search).get('consult') === '1') openDialog();
})();
