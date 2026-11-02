/* App Sale · Xe lái thử · v1.2
   Dùng chung cho tab Lái thử (sale, có PIN) và link /laithu (bộ phận khác, không PIN).
   Cần nạp trước: samco-core api.js + ui.js. Gọi LT.mount(container, { auth: () => auth, onAuthFail, base: '' }). */
(function () {
  const CSS = `
  .lt-mine{display:flex;flex-direction:column;gap:6px;background:var(--accent-soft);border:1px solid var(--accent);border-radius:14px;padding:12px 14px}
  .lt-mine button{display:flex;justify-content:space-between;align-items:center;gap:8px;border:0;background:none;padding:6px 0;text-align:left;cursor:pointer;font-size:14px}
  .lt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .lt-car{display:flex;flex-direction:column;gap:3px;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:left;cursor:pointer;min-height:84px}
  .lt-car .n{font-family:var(--display);font-size:20px;line-height:1.1;text-transform:uppercase}
  .lt-car .b{font-family:var(--mono);font-size:12px;color:var(--muted)}
  .lt-car .s{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;margin-top:auto}
  .lt-car .s i{width:8px;height:8px;border-radius:99px;flex-shrink:0}
  .lt-san i{background:var(--ok)}.lt-san{color:var(--ok)}
  .lt-di i,.lt-dat i{background:var(--accent)}.lt-di,.lt-dat{color:var(--accent)}
  .lt-sac i{background:var(--warn)}.lt-sac{color:var(--warn)}
  .lt-dv i{background:var(--warn)}.lt-dv{color:var(--warn)}.lt-ngung i{background:var(--muted)}.lt-ngung{color:var(--muted)}
  .lt-log{display:flex;flex-direction:column;gap:2px;border-top:1px solid var(--line);padding:9px 0;font-size:13px}
  .lt-log .lech{font-size:12px;font-weight:700;color:var(--bad)}
  .lt-sec{display:flex;flex-direction:column;gap:10px;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
  .lt-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .lt-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
  .lt-3 .lbl{white-space:nowrap;letter-spacing:.1em}
  .lt-cond{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:13px;font-weight:600}
  .lt-cond:first-of-type{border-top:0}
  .lt-cond .pill{min-height:34px;font-size:12px}
  .lt-cond .pill.on{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
  .lt-cond .pill.on.bad{background:var(--bad-soft);border-color:var(--bad);color:var(--bad)}
  .lt-photo{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .lt-photo button{min-height:64px;border:1.5px dashed var(--line);border-radius:12px;background:var(--paper-2);font-size:12px;font-weight:600;cursor:pointer}
  .lt-photo button.has{border-style:solid;border-color:var(--ok);color:var(--ok);background:var(--ok-soft)}
  #ltPrint{display:none}
  @media print{
    @page{size:A4;margin:0}
    body>*:not(#ltPrint){display:none!important}
    #ltPrint{display:block!important}
    .lt-page{width:210mm;height:297mm;page-break-after:always;overflow:hidden}
    .lt-page:last-child{page-break-after:auto}
  }
  .lt-page{box-sizing:border-box;background:#fff;color:#111;padding:11mm 15mm 12mm;display:flex;flex-direction:column}
  .lt-page .tnr,.lt-page.tnr{font-family:"Times New Roman",Tinos,"Liberation Serif",serif}
  .lt-page .ar{font-family:Arial,Arimo,Helvetica,sans-serif}
  .lt-f{display:grid;align-items:end;gap:0}
  .lt-v{border-bottom:1px dotted #111;font-weight:700;padding-left:6px;min-height:1.3em}
  .lt-box{width:14px;height:14px;border:1px solid #111;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:11px}
  `;
  const CAM_KET = [
    'Bằng Giấy Cam Kết này, tôi tự nguyện đăng ký tham gia lái thử xe ô tô VinFast do Công ty tổ chức tại <b>VinFast SAMCO Bình Tân</b> và cam kết tuân thủ theo những điều khoản sau:',
    '1. Cung cấp đầy đủ và chịu hoàn toàn mọi trách nhiệm pháp lý về các thông tin, giấy tờ cá nhân theo yêu cầu của Công ty và các bên liên quan trong thời gian tham gia chương trình.',
    '2. Tuyệt đối tuân thủ các điều lệ, nguyên tắc của Luật giao thông đường bộ và xe cơ giới. Đồng thời tuân thủ theo các hướng dẫn của nhân viên hướng dẫn lái thử xe trong khi tham gia lái thử xe, cũng như không được thực hiện bất kỳ hoạt động nào khác không nằm trong chương trình.',
    '3.Tôi đảm bảo rằng quyết định tham gia của mình trong việc tham gia lái thử xe này được đưa ra sau khi tôi đã xem xét, cân nhắc kỹ lưỡng. Tôi hiểu rằng việc lái thử xe ô tô này có thể bao gồm nguy cơ xảy ra những thương tích, tai nạn hoặc thương vong (những nguy cơ này có thể xảy ra do bất kỳ lý do gì, bao gồm nhưng không giới hạn do sự hỏng hóc, sự cố, hoặc lỗi kỹ thuật của xe, những hành động cố tình hoặc vô ý của tôi hoặc của những thành viên tham gia chương trình, v.v…). Tuy nhiên, tôi tình nguyện tham lái thử xe như vậy và chấp nhận những nguy cơ có thể xảy ra nêu trên trong suốt quá trình lái thử xe ... Đồng thời, tôi xin chịu trách nhiệm về các tổn thất, hư hỏng cho xe cũng như mọi tổn thất về người hoặc về tài sản do tôi gây ra cho người thứ ba trong quá trình lái thử xe.',
    '4. Tôi đồng ý và cam kết miễn truy cứu trách nhiệm, cũng như miễn việc yêu cầu Công ty, chi nhánh, các công ty liên quan và nhân viên trực thuộc các Công ty bồi thường thiệt hại xảy ra (nếu có) trong mọi trường hợp trong quá trình hoặc có liên quan đến việc chay thử xe này và dù vì bất kỳ nguyên nhân nào. Tôi thừa nhận rằng Công ty và các đơn vị và cá nhân nêu trên không có nghĩa vụ bồi thường nào liên quan đến bất kỳ trách nhiệm, nguyên nhân gây thiệt hại anào (bao gồm nhưng không giới hạn, thiệt hại trực tiếp và thực tế) trong mọi trường hợp trong quá trình hoặc có liên quan đến việc chay thử xe này. Tôi cam kết và từ bỏ mọi quyền yêu cầu bồi thường, khiếu nại, kiện tụng (bao gồm nhưng không giới hạn, thương tích cá nhân, tai nạn về thương vong, thiệt hại về tài sản hoặc các vấn đề tương tự cho người và tài sản của tôi hoặc của bất kỳ bên thứ ba nào khác) có thể phát sinh trực tiếp hoặc gián tiếp từ việc tham gia lái thử xe này, kể cả phát sinh trong các trường hợp bất khả kháng (bao gồm nhưng không giới hạn: thiên tai, hỏa hoạn, lũ lụt, khủng bố hay chiến tranh ...) đối với Công ty, chi nhánh, các công ty liên quan và nhân viên trực thuộc các Công ty trong mọi trường hợp và dù vì bất kỳ nguyên nhân nào..',
    '5. Tôi đồng ý và ủng hộ hoàn toàn việc Công ty thu thập, sử dụng miễn phí các thông tin cá nhân, hình ảnh, video về tôi và/ hoặc do tôi tạo ra và/ hoặc được tạo ra từ trong chương trình lái thử xe này để sử dụng nội bộ và/ hoặc quảng cáo, đăng tải trên các phương tiện thông tin đại chúng. Bên cạnh đó, Công ty được phép gửi các thông tin cá nhân, tư liệu, hình ảnh, video nêu trên cho công ty mình và các công ty khác cung cấp dịch vụ quảng cáo cho Công ty tại Việt Nam hoặc trên thế giới.',
    '6. Giấy Cam Kết này chịu sự điều chỉnh của Pháp luật Việt Nam. Trong trường hợp có bất kì vần đề, tranh chấp nảy sinh thì tranh chấp đó sẽ được đưa ra giải quyết tại cơ quan Tòa án có thẩm quyền tại Việt Nam.',
    '7. Giấy Cam Kết này sẽ có hiệu lực ràng buộc với bất kỳ bên thứ ba nào là người thừa kế và/ hoặc người được ủy quyền từ tôi.'
  ];

  let opt = null, root = null, D = null, printCache = {};
  const sheet = (id) => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const isoNow = (addMin) => { const d = new Date(Date.now() + (addMin || 0) * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const hmNow = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const isoToVn = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? { d: m[3] + '/' + m[2] + '/' + m[1], h: m[4] + ':' + m[5], dd: m[3], mm: m[2], yy: m[1] } : null; };

  function api(fn, ...a) { return call(fn, opt.auth(), ...a); }
  function fail(e) {
    if (/đăng nhập|PIN/i.test(String(e)) && opt.onAuthFail) return opt.onAuthFail(e);
    toast(e, 1);
  }
  function openS(id) { sheet(id).hidden = false; document.body.style.overflow = 'hidden'; }
  function closeS(id) { sheet(id).hidden = true; if (!document.querySelector('.sheet-bg:not([hidden])')) document.body.style.overflow = ''; }

  /* ---------- Khung giao diện ---------- */
  function mount(el, o) {
    opt = o; root = el;
    if (!document.getElementById('ltCss')) { const s = document.createElement('style'); s.id = 'ltCss'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">
      <div id="ltMine"></div>
      <span class="sect">10 xe demo · chọn xe để lấy</span>
      <div class="lt-grid" id="ltGrid"><div class="loading"><span class="spin"></span>Đang tải…</div></div>
    </div>`;
    if (!sheet('ltCarDlg')) document.body.insertAdjacentHTML('beforeend', DIALOGS);
    bind();
  }

  async function load() {
    try {
      D = await api('ltInit');
      render();
    } catch (e) {
      if (/đăng nhập|PIN/i.test(String(e)) && opt.onAuthFail) return opt.onAuthFail(e);
      $('#ltGrid').innerHTML = `<div class="empty" style="grid-column:1/-1">${esc(e)}<br><button class="btn sm out" style="margin-top:10px" id="ltRetry">Thử lại</button></div>`;
      $('#ltRetry').onclick = load;
    }
  }

  function render() {
    const mine = D.mine;
    $('#ltMine').innerHTML = mine.length ? `<div class="lt-mine"><span class="sect">Phiếu của bạn · ${mine.length}</span>${mine.map(p => {
      const car = D.cars.find(c => c.bien === p.bien) || {};
      const t = p.trangThai === 'Đang dùng' ? 'đang dùng · về ' + p.veDkHm : 'đặt ' + p.diDkHm + ' ' + p.ngay;
      return `<button data-phieu="${esc(p.id)}"><span><b>${esc(car.loai || p.bien)}</b> ${esc(t)}</span><span class="small b" style="color:var(--accent);white-space:nowrap">${p.trangThai === 'Đang dùng' ? 'Trả xe' : 'ODO · Trả xe'} ›</span></button>`;
    }).join('')}</div>` : '';
    $('#ltGrid').innerHTML = D.cars.map(c => `<button class="lt-car" data-bien="${esc(c.bien)}">
      <span class="n">${esc(c.loai)}</span><span class="b">${esc(c.bien)}</span>
      <span class="s lt-${c.st}"><i></i>${esc(c.label)}</span></button>`).join('');
  }

  /* ---------- Xe: thông tin + nhật trình ---------- */
  async function openCar(bien) {
    const c = D.cars.find(x => x.bien === bien); if (!c) return;
    $('#ltCarTitle').textContent = c.loai + ' · ' + c.bien;
    $('#ltCarInfo').innerHTML = `<span class="chip ${({ san: 'ok', sac: 'warn', di: 'acc', dat: 'acc', dv: 'warn' })[c.st] || 'mute'}">${esc(c.label)}</span>
      <span class="small muted">ODO ${c.odo === '' ? '—' : num(c.odo)} · pin ${c.pin == null ? '—' : c.pin + '%'}</span>`;
    const free = c.st === 'san' || c.st === 'sac' || c.st === 'dv';
    const mine = c.mine && c.phieu;
    $('#ltCarNew').hidden = !free && !mine;
    $('#ltCarNew').textContent = mine ? 'Phiếu của bạn · ODO · Trả xe' : 'Lập phiếu lái thử';
    $('#ltCarNew').onclick = () => { closeS('ltCarDlg'); if (mine) openUse(c.phieu); else openForm(c, null); };
    $('#ltLogList').innerHTML = '<div class="loading"><span class="spin"></span>Đang tải…</div>';
    openS('ltCarDlg');
    try {
      const L = await api('ltLog', bien);
      const t = L.truoc;
      $('#ltLogList').innerHTML = t ? `<div class="card flat" style="padding:4px 14px">
          <div class="kv"><span>Người mượn</span><b>${esc(t.nguoi)}${t.muc ? ' · ' + esc(t.muc) : ''}</b></div>
          <div class="kv"><span>Trả xe lúc</span><span class="mono">${esc(t.tra || '—')}</span></div>
          <div class="kv"><span>ODO kết thúc</span><span class="mono b">${esc(t.odoVe || '—')}</span></div>
          <div class="kv"><span>Pin kết thúc</span><span class="mono b">${t.pin === '' || t.pin == null ? '—' : esc(t.pin) + '%'}</span></div>
        </div>` : '<div class="empty">Chưa có chuyến nào.</div>';
    } catch (e) { $('#ltLogList').innerHTML = `<div class="empty">${esc(e)}</div>`; }
  }

  /* ---------- Bước 1: phiếu ---------- */
  let F = null; // {car, id, anhTruoc, anhSau}
  function openForm(car, p) {
    F = { car: car, id: p ? p.id : null, anhTruoc: '', anhSau: '', saved: !!p };
    $('#ltFormTitle').textContent = 'Phiếu lái thử · ' + car.loai + ' ' + car.bien;
    const muc = p ? p.muc : '';
    $('#ltMuc').innerHTML = D.mucDich.map(m => `<button type="button" class="pill${m === muc ? ' on' : ''}" data-v="${esc(m)}">${esc(m)}</button>`).join('');
    const v = (id, x) => { $('#' + id).value = x || ''; };
    v('ltKh', p && p.kh); v('ltSdt', p && p.sdt); v('ltDiaChi', p && p.diaChi); v('ltGplx', p && p.gplx); v('ltHan', p && p.hanGplx);
    const cache = p && printCache[p.id] || {};
    v('ltCccd', cache.cccd); v('ltCapNgay', cache.capNgay); v('ltNoiCap', cache.noiCap);
    $('#ltDongY').checked = p ? p.dongY : false; $('#ltTuLai').checked = p ? p.tuLai : true;
    v('ltLoTrinh', p && p.loTrinh); v('ltDiDk', p ? p.diDk : isoNow(10)); v('ltVeDk', p ? p.veDk : isoNow(70));
    $$('#ltPhoto button').forEach(b => { b.classList.remove('has'); b.textContent = b.dataset.side === 'truoc' ? 'Bằng lái mặt trước' : 'Mặt sau'; });
    if (p && p.coAnh) $('#ltPhoto [data-side=truoc]').textContent = 'Đã có ảnh · chụp lại';
    syncForm(); openS('ltFormDlg');
  }
  function syncForm() {
    const muc = (document.querySelector('#ltMuc .pill.on') || {}).dataset;
    const khach = muc && muc.v === 'Khách lái thử';
    $('#ltKhach').hidden = !khach;
    $('#ltMucHint').hidden = khach || !muc;
    $('#ltPhoto').style.opacity = $('#ltDongY').checked ? 1 : .45;
  }
  function formData() {
    const muc = document.querySelector('#ltMuc .pill.on');
    return { bien: F.car.bien, mucDich: muc ? muc.dataset.v : '', kh: $('#ltKh').value, sdt: $('#ltSdt').value, diaChi: $('#ltDiaChi').value,
      gplx: $('#ltGplx').value, hanGplx: $('#ltHan').value, dongY: $('#ltDongY').checked, tuLai: $('#ltTuLai').checked,
      anhTruoc: F.anhTruoc, anhSau: F.anhSau, loTrinh: $('#ltLoTrinh').value, diDk: $('#ltDiDk').value, veDk: $('#ltVeDk').value };
  }
  async function saveForm(btn, thenPrint) {
    const d = formData();
    if (!d.mucDich) return toast('Vui lòng chọn mục đích.', 1);
    if (d.mucDich === 'Khách lái thử' && !d.kh.trim()) return toast('Vui lòng nhập họ tên khách.', 1);
    if (!d.loTrinh.trim()) return toast('Vui lòng nhập lộ trình hoặc nội dung.', 1);
    return busy(btn, 'Đang lưu', async () => {
      try {
        const p = await api('ltSave', d, F.id);
        // CCCD chỉ giữ trên máy để in, không gửi lên hệ thống
        printCache[p.id] = { cccd: $('#ltCccd').value.trim(), capNgay: $('#ltCapNgay').value.trim(), noiCap: $('#ltNoiCap').value.trim() };
        F.id = p.id; F.anhTruoc = F.anhSau = '';
        closeS('ltFormDlg'); toast('Đã lưu phiếu ' + p.id);
        if (thenPrint) doPrint(p);
        load();
      } catch (e) { fail(e); }
    });
  }

  /* ---------- Bước 2: lên xe / trả xe ---------- */
  let U = null;
  function openUse(id) {
    const p = D.mine.find(x => x.id === id); if (!p) return;
    U = p;
    const car = D.cars.find(c => c.bien === p.bien) || { loai: '', bien: p.bien, odo: '' };
    $('#ltUseTitle').textContent = 'Sử dụng xe · ' + car.loai;
    $('#ltUseBien').textContent = car.bien;
    $('#ltUseInfo').innerHTML = `<span class="muted">${esc(p.muc)}${p.kh ? ' · ' + esc(p.kh) : ''}</span><span class="mono">${esc(p.diDkHm)}–${esc(p.veDkHm)}</span>`;
    $('#ltOdoDi').value = p.odoDi || (car.odo === '' ? '' : car.odo);
    $('#ltOdoHint').textContent = (car.odo !== '' ? 'ODO đi tự điền theo lần trả gần nhất (' + num(car.odo) + ') · sửa nếu khác. ' : '') + 'Có thể lưu ODO đi trước, ODO về điền sau.';
    $('#ltOdoVe').value = ''; $('#ltGioDi').value = p.gioDi || p.diDkHm || hmNow(); $('#ltGioVe').value = hmNow(); $('#ltPin').value = '';
    $$('#ltCond .lt-cond').forEach(r => setCond(r, 'Tốt'));
    $('#ltKyWrap').hidden = p.muc !== 'Khách lái thử'; $('#ltKy').checked = false; $('#ltDon').checked = false; $('#ltSac').checked = false; $('#ltGhi').value = '';
    $('#ltStartBtn').hidden = p.trangThai !== 'Đã đăng ký'; $('#ltCancelBtn').hidden = p.trangThai !== 'Đã đăng ký'; $('#ltEditBtn').hidden = p.trangThai !== 'Đã đăng ký';
    calcKm(); openS('ltUseDlg');
  }
  function setCond(row, v) { $$('.pill', row).forEach(b => { b.classList.toggle('on', b.dataset.v === v); b.classList.toggle('bad', b.dataset.v === 'Có vấn đề'); }); }
  function calcKm() {
    const a = Number(String($('#ltOdoDi').value).replace(/[^\d]/g, '')), b = Number(String($('#ltOdoVe').value).replace(/[^\d]/g, ''));
    const g1 = $('#ltGioDi').value, g2 = $('#ltGioVe').value;
    let t = '';
    if (a && b && b >= a) t = (b - a) + ' km';
    if (g1 && g2) { let m = (+g2.slice(0, 2) * 60 + +g2.slice(3)) - (+g1.slice(0, 2) * 60 + +g1.slice(3)); if (m < 0) m += 1440; t += (t ? ' · ' : '') + Math.floor(m / 60) + ' giờ ' + (m % 60) + ' phút'; }
    $('#ltKm').textContent = t || '—';
  }

  /* ---------- In hồ sơ: 2 trang A4 (Công tác: chỉ Lệnh điều xe) ---------- */
  function doPrint(p) {
    const car = D.cars.find(c => c.bien === p.bien) || { loai: '', bien: p.bien };
    const me = D.me, x = printCache[p.id] || {};
    const di = isoToVn(p.diDk) || {}, ve = isoToVn(p.veDk) || {};
    const val = (s, cls) => `<span class="lt-v${cls ? ' ' + cls : ''}">${s ? esc(s) : '&nbsp;'}</span>`;
    const chucVu = me.vaiTro === 'Sale' ? 'Nhân viên bán hàng' : me.vaiTro === 'Quản lý' ? 'Quản lý' : 'Nhân viên';
    const khach = p.muc === 'Khách lái thử';
    const lenh = `<div class="tnr" style="display:flex;flex-direction:column;gap:9px;font-size:13.5px">
      <div style="display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:12px"><span>NHÀ MÁY Ô TÔ THƯƠNG MẠI SAMCO<br><b>SAMCO BÌNH TÂN</b></span><span><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc Lập – Tự Do – Hạnh Phúc</b></span></div>
      <div style="text-align:center;font-size:20px;font-weight:700;padding-top:6px">LỆNH ĐIỀU XE ĐI CÔNG TÁC</div>
      <div style="text-align:center">.........................................(Biển số: <b>${esc(car.bien)}</b>)</div>
      <div style="text-align:center;font-weight:700;font-style:italic;padding:4px 0 2px">Kính gửi: Ban Giám Đốc Nhà máy ô tô Thương mại SAMCO</div>
      <div class="lt-f" style="grid-template-columns:150px 1fr"><span>Họ tên người đề nghị:</span>${val(me.ten)}</div>
      <div class="lt-f" style="grid-template-columns:150px 1fr"><span>Chức vụ:</span>${val(chucVu)}</div>
      <div class="lt-f" style="grid-template-columns:150px 1fr"><span>Vị trí công tác:</span>${val(me.boPhan ? 'Phòng ' + me.boPhan : '')}</div>
      <div class="lt-f" style="grid-template-columns:195px 1fr"><span>Mục đích chuyến đi công tác:</span>${val(p.muc + (khach ? ' · ' + p.kh : ' · ' + p.loTrinh))}</div>
      <div class="lt-f" style="grid-template-columns:90px 1fr 95px 1fr"><span>Thời gian đi:</span>${val((di.h || '') + ' ' + (di.d || ''))}<span style="padding-left:6px">Thời gian về:</span>${val((ve.h || '') + ' ' + (ve.d || ''))}</div>
      <div style="text-align:right">TP.HCM, ngày ${di.dd || '...'} tháng ${di.mm || '...'} năm ${di.yy || '......'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr"><b>DUYỆT</b><b style="text-align:center">PHỤ TRÁCH BỘ PHẬN</b><b style="text-align:right">NGƯỜI ĐỀ NGHỊ</b></div>
      <div style="text-align:right;padding-top:46px">${esc(me.ten)}</div></div>`;
    const phieu = `<div class="ar" style="border:1.5px solid #111;display:flex;flex-direction:column;font-size:12px">
      <div style="display:flex;flex-direction:column;gap:7px;padding:6px">
        <div style="display:grid;grid-template-columns:90px 1fr 90px;align-items:start"><img src="${opt.base || ''}logo-vinfast.jpg" alt="VinFast" style="width:64px"><div style="text-align:center;font-size:16px;font-weight:700;padding-top:6px">PHIẾU YÊU CẦU LÁI THỬ</div><div></div></div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-style:italic"><span>Tên showroom: VinFast SAMCO Bình Tân</span><span>Số phiếu: ${esc(p.id)}</span></div>
        <div class="lt-f" style="grid-template-columns:118px 1fr 104px 1fr;gap:7px 0"><span>Ngày thử xe:</span>${val(di.d ? di.dd + ' / ' + di.mm + ' / ' + di.yy : '')}<span style="padding-left:6px">Loại xe:</span>${val(car.loai + ' · ' + car.bien)}
          <span>Thời gian khởi hành:</span>${val(di.h)}<span style="padding-left:6px">Thời gian trở về:</span>${val(ve.h)}</div>
        <div class="lt-f" style="grid-template-columns:118px 1fr"><span>Lộ trình:</span>${val(p.loTrinh)}</div></div>
      <div style="border-top:1px solid #111;display:flex;flex-direction:column;gap:8px;padding:6px">
        <div class="lt-f" style="grid-template-columns:118px 1fr 80px 1fr"><span>Tên khách hàng:</span>${val(p.kh)}<span style="padding-left:6px">Điện thoại:</span>${val(p.sdt)}</div>
        <div class="lt-f" style="grid-template-columns:118px 1fr"><span>Địa chỉ hiện tại:</span>${val(p.diaChi)}</div>
        <div style="display:grid;grid-template-columns:1fr 110px 110px;align-items:center"><span>Khách hàng muốn tự lái thử xe:</span><span>Có <span class="lt-box">${p.tuLai ? 'X' : ''}</span></span><span>Không <span class="lt-box">${p.tuLai ? '' : 'X'}</span></span></div>
        <div class="lt-f" style="grid-template-columns:200px 1fr"><span>Đặc điểm khách hàng quan tâm:</span>${val('')}</div>
        <div class="lt-f" style="grid-template-columns:215px 1fr 122px 90px"><span>Giấy phép lái xe của khách hàng số:</span>${val(p.gplx)}<span style="padding-left:6px">Hiệu lực đến ngày:</span>${val(p.hanGplx)}</div>
        <div style="font-style:italic">(TVBH phô tô và lưu lại 01 bản bằng lái xe của khách hàng)</div></div>
      <div style="border-top:1px solid #111;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));text-align:center">
        <div style="border-right:1px solid #111;padding:6px 4px 0;display:flex;flex-direction:column;gap:4px;font-weight:700;min-height:110px">Người đề nghị<span style="font-weight:400">Khách hàng ký tên</span><span style="margin-top:auto;padding-bottom:6px;font-weight:400">${esc(p.kh)}</span></div>
        <div style="border-right:1px solid #111;padding:6px 4px 0;display:flex;flex-direction:column;font-weight:700">Người lập phiếu<span style="margin-top:auto;padding-bottom:6px;font-weight:400">${esc(me.ten)}</span></div>
        <div style="padding:6px 4px 0;font-weight:700">Người phê duyệt</div></div></div>`;
    const camket = `<div class="lt-page tnr" style="gap:7px;font-size:12.5px;line-height:1.36;padding:13mm 17mm 12mm">
      <div style="text-align:center">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập - Tự do - Hạnh phúc<br>---------------------------</div>
      <div style="text-align:center;font-size:17px;font-weight:700;padding-top:4px">GIẤY CAM KẾT</div>
      <div style="text-align:center;font-weight:700"><i><u>Kính gửi</u></i>: NHÀ MÁY Ô TÔ THƯƠNG MẠI SAMCO (SAMCO BÌNH TÂN)</div>
      <div class="lt-f" style="grid-template-columns:72px 1fr"><span>Tôi tên là:</span>${val(p.kh)}</div>
      <div class="lt-f" style="grid-template-columns:72px 1fr"><span>Địa chỉ:</span>${val(p.diaChi)}</div>
      <div class="lt-f" style="grid-template-columns:86px 1.3fr 30px 1fr 70px 1fr"><span>CMND/CCCD:</span>${val(x.cccd)}<span style="padding-left:4px">Do:</span>${val(x.noiCap)}<span style="padding-left:4px">Cấp ngày :</span>${val(x.capNgay)}</div>
      <div class="lt-f" style="grid-template-columns:108px 1fr 92px 1fr"><span>Giấy phép lái xe:</span>${val(p.gplx)}<span style="padding-left:8px">Hiệu lực đến:</span>${val(p.hanGplx)}</div>
      ${CAM_KET.map((t, i) => `<div style="text-align:justify;${i === 0 ? 'padding-top:6px' : ''}">${t}</div>`).join('')}
      <div style="padding-top:6px">TÔI ĐÃ ĐỌC VÀ HIỂU RÕ MỌI NỘI DUNG NÊU TRÊN CỦA "GIẤY CAM KẾT" VÀ TỰ NGUYỆN ĐỒNG Ý VỚI NHỮNG CAM KẾT NÊU TRÊN.</div>
      <div style="align-self:flex-end;width:250px;text-align:center;display:flex;flex-direction:column;gap:4px"><span>TP.HCM, ngày ${di.d || '....../....../......'}</span><span>Ký và ghi rõ họ tên</span><span style="padding-top:60px;font-weight:700">${esc(p.kh)}</span></div></div>`;
    const page1 = khach
      ? `<div class="lt-page" style="justify-content:space-between">${lenh}<div style="border-top:1px dashed #9aa1ab;margin:4mm 0"></div>${phieu}</div>${camket}`
      : `<div class="lt-page">${lenh}</div>`;
    let pr = document.getElementById('ltPrint');
    if (!pr) { pr = document.createElement('div'); pr.id = 'ltPrint'; document.body.appendChild(pr); }
    pr.innerHTML = page1;
    const img = pr.querySelector('img');
    const go = () => setTimeout(() => window.print(), 150);
    if (img && !img.complete) { img.onload = go; img.onerror = go; } else go();
  }

  /* ---------- Sự kiện ---------- */
  function bind() {
    root.addEventListener('click', e => {
      const ph = e.target.closest('[data-phieu]'); if (ph) return openUse(ph.dataset.phieu);
      const c = e.target.closest('.lt-car'); if (c) return openCar(c.dataset.bien);
    });
    if (bind.done) return; bind.done = true;
    document.addEventListener('click', e => {
      const bg = e.target.classList && e.target.classList.contains('sheet-bg') && e.target.id && e.target.id.indexOf('lt') === 0;
      if (bg) closeS(e.target.id);
      const cl = e.target.closest('[data-close]'); if (cl) closeS(cl.dataset.close);
    });
    $('#ltMuc').addEventListener('click', e => { const p = e.target.closest('.pill'); if (!p) return; $$('#ltMuc .pill').forEach(x => x.classList.toggle('on', x === p)); syncForm(); });
    $('#ltDongY').onchange = syncForm;
    $('#ltPhoto').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (!$('#ltDongY').checked) return toast('Chỉ chụp bằng lái khi khách đồng ý cho lưu ảnh.', 1);
      $('#ltPhotoIn').dataset.side = b.dataset.side; $('#ltPhotoIn').click();
    });
    $('#ltPhotoIn').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      try {
        const side = $('#ltPhotoIn').dataset.side, b64 = await shrinkImage(f, 1600, 0.82);
        if (side === 'truoc') F.anhTruoc = b64; else F.anhSau = b64;
        const b = $('#ltPhoto [data-side=' + side + ']'); b.classList.add('has'); b.textContent = (side === 'truoc' ? 'Mặt trước' : 'Mặt sau') + ' · đã chụp';
      } catch (err) { toast(err, 1); }
    };
    $('#ltSaveBtn').onclick = () => saveForm($('#ltSaveBtn'), false);
    $('#ltPrintBtn').onclick = () => saveForm($('#ltPrintBtn'), true);
    ['#ltOdoDi', '#ltOdoVe', '#ltGioDi', '#ltGioVe'].forEach(s => $(s).addEventListener('input', calcKm));
    $('#ltCond').addEventListener('click', e => { const b = e.target.closest('.pill'); if (b) setCond(b.closest('.lt-cond'), b.dataset.v); });
    $('#ltStartBtn').onclick = () => {
      const odo = $('#ltOdoDi').value.trim(); if (!odo) return toast('Vui lòng nhập ODO đi.', 1);
      busy($('#ltStartBtn'), '', async () => {
        try { await api('ltStart', U.id, { odoDi: odo, gioDi: $('#ltGioDi').value }); closeS('ltUseDlg'); toast('Đã lưu ODO đi. Chúc chuyến đi an toàn.'); load(); } catch (e) { fail(e); }
      });
    };
    $('#ltReturnBtn').onclick = () => {
      const cond = {}; $$('#ltCond .lt-cond').forEach(r => { cond[r.dataset.k] = ($('.pill.on', r) || {}).dataset ? $('.pill.on', r).dataset.v : 'Tốt'; });
      const d = Object.assign({ odoDi: $('#ltOdoDi').value.trim(), odoVe: $('#ltOdoVe').value.trim(), gioDi: $('#ltGioDi').value, gioVe: $('#ltGioVe').value, pin: $('#ltPin').value.trim(),
        daKy: $('#ltKy').checked, daDon: $('#ltDon').checked, daSac: $('#ltSac').checked, ghiChu: $('#ltGhi').value }, cond);
      if (!d.odoDi || !d.odoVe) return toast('Vui lòng nhập ODO đi và ODO về (không nhớ thì ghi “Không nhớ”).', 1);
      if (!d.gioDi || !d.gioVe) return toast('Vui lòng nhập giờ đi và giờ về.', 1);
      if (d.pin === '') return toast('Vui lòng nhập % pin lúc về.', 1);
      if (U.muc === 'Khách lái thử' && !d.daKy) return toast('Vui lòng xác nhận khách đã ký hồ sơ.', 1);
      busy($('#ltReturnBtn'), 'Đang lưu', async () => {
        try { const r = await api('ltReturn', U.id, d); closeS('ltUseDlg'); toast('Đã trả xe' + (r.km !== '' ? ' · ' + r.km + ' km' : '') + '. Cảm ơn anh/chị.'); load(); } catch (e) { fail(e); }
      });
    };
    $('#ltReprint').onclick = () => doPrint(U);
    $('#ltLogBtn').onclick = () => { closeS('ltUseDlg'); openCar(U.bien); };
    $('#ltEditBtn').onclick = () => { closeS('ltUseDlg'); openForm(D.cars.find(c => c.bien === U.bien) || { loai: '', bien: U.bien }, U); };
    $('#ltCancelBtn').onclick = () => {
      if (!confirm('Hủy phiếu ' + U.id + '?')) return;
      busy($('#ltCancelBtn'), '', async () => { try { await api('ltCancel', U.id); closeS('ltUseDlg'); toast('Đã hủy phiếu'); load(); } catch (e) { fail(e); } });
    };
  }

  const DIALOGS = `
<div class="sheet-bg" id="ltCarDlg" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ltCarTitle"><div class="grab"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div id="ltCarTitle" style="font-family:var(--display);font-size:24px;text-transform:uppercase"></div><button class="btn sm" data-close="ltCarDlg">Đóng</button></div>
  <div id="ltCarInfo" style="display:flex;justify-content:space-between;align-items:center;gap:8px"></div>
  <button class="btn cta pri" id="ltCarNew">Lập phiếu lái thử</button>
  <span class="sect" id="ltLogHead">Chuyến trước</span>
  <div id="ltLogList"></div>
</div></div>

<div class="sheet-bg" id="ltFormDlg" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ltFormTitle"><div class="grab"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div style="display:flex;flex-direction:column;gap:2px"><span class="lbl">Bước 1 · đăng ký trước khi ra xe</span><div id="ltFormTitle" style="font-family:var(--display);font-size:22px;text-transform:uppercase;line-height:1.1"></div></div><button class="btn sm" data-close="ltFormDlg">Đóng</button></div>
  <div class="field"><span class="lbl">Mục đích <span class="req">*</span></span><div class="pills" id="ltMuc" style="display:grid;grid-template-columns:1fr 1fr"></div>
    <span class="hint" id="ltMucHint" hidden>Công tác (gồm cả sự kiện): ghi nội dung vào Lộ trình. Chỉ in Lệnh điều xe.</span></div>
  <div class="lt-sec" id="ltKhach" hidden>
    <span class="sect">Khách hàng</span>
    <label class="field"><span class="lbl">Họ tên <span class="req">*</span></span><input class="inp" id="ltKh" autocomplete="off"></label>
    <div class="lt-2"><label class="field"><span class="lbl">SĐT</span><input class="inp mono" id="ltSdt" type="tel" placeholder="Không bắt buộc"></label>
      <label class="field"><span class="lbl">Địa chỉ</span><input class="inp" id="ltDiaChi" placeholder="Không bắt buộc"></label></div>
    <div class="lt-3"><label class="field"><span class="lbl">CCCD</span><input class="inp mono" id="ltCccd" inputmode="numeric" placeholder="Không bắt buộc"></label>
      <label class="field"><span class="lbl">Ngày cấp</span><input class="inp mono" id="ltCapNgay" placeholder="dd/mm/yyyy"></label>
      <label class="field"><span class="lbl">Nơi cấp</span><input class="inp" id="ltNoiCap" placeholder="Cục CS"></label></div>
    <span class="hint">Ô để trống sẽ in thành dòng chấm để khách điền tay. CCCD chỉ dùng để in, không lưu vào hệ thống.</span>
    <div class="lt-2"><label class="field"><span class="lbl">Số bằng lái</span><input class="inp mono" id="ltGplx" placeholder="Không bắt buộc"></label>
      <label class="field"><span class="lbl">Hạn</span><input class="inp mono" id="ltHan" placeholder="VD: 12/2033"></label></div>
    <label class="check"><input type="checkbox" id="ltDongY">Khách đồng ý cho lưu ảnh bằng lái</label>
    <div class="lt-photo" id="ltPhoto"><button type="button" data-side="truoc">Bằng lái mặt trước</button><button type="button" data-side="sau">Mặt sau</button></div>
    <input type="file" accept="image/*" id="ltPhotoIn" hidden>
    <label class="check"><input type="checkbox" id="ltTuLai" checked>Khách tự lái</label>
  </div>
  <div class="lt-sec"><span class="sect">Lịch đi</span>
    <label class="field"><span class="lbl">Lộ trình · nội dung <span class="req">*</span></span><input class="inp" id="ltLoTrinh" placeholder="VD: Showroom → Võ Văn Kiệt → Showroom"></label>
    <div class="lt-2"><label class="field"><span class="lbl">Giờ đi dự kiến <span class="req">*</span></span><input class="inp mono" id="ltDiDk" type="datetime-local"></label>
      <label class="field"><span class="lbl">Giờ về dự kiến <span class="req">*</span></span><input class="inp mono" id="ltVeDk" type="datetime-local"></label></div>
    <span class="hint">ODO và pin điền sau, lúc lên xe hoặc khi trả xe.</span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <button class="btn out" id="ltPrintBtn" style="min-height:52px;font-weight:800;letter-spacing:.08em">IN HỒ SƠ (PDF)</button>
    <button class="btn pri" id="ltSaveBtn" style="min-height:52px;font-weight:800;letter-spacing:.12em">LƯU PHIẾU</button></div>
  <span class="hint" style="text-align:center">In hồ sơ: Lệnh điều xe + Phiếu yêu cầu (trang 1) · Giấy cam kết (trang 2)</span>
</div></div>

<div class="sheet-bg" id="ltUseDlg" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ltUseTitle"><div class="grab"></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:8px"><div style="display:flex;flex-direction:column;gap:2px"><span class="lbl">Bước 2 · lên xe hoặc trả xe</span><div id="ltUseTitle" style="font-family:var(--display);font-size:24px;text-transform:uppercase;line-height:1.1"></div></div>
    <span class="mono b" id="ltUseBien"></span></div>
  <div class="card flat" id="ltUseInfo" style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:10px 12px"></div>
  <div class="lt-2"><label class="field"><span class="lbl">ODO đi <span class="req">*</span></span><input class="inp mono" id="ltOdoDi" inputmode="numeric"></label>
    <label class="field"><span class="lbl">ODO về <span class="req">*</span></span><input class="inp mono" id="ltOdoVe" inputmode="numeric"></label></div>
  <span class="hint"><span id="ltOdoHint"></span><br><b style="color:var(--ink)">Không nhớ ODO</b>: ghi “Không nhớ”.</span>
  <div class="lt-3"><label class="field"><span class="lbl">Giờ đi <span class="req">*</span></span><input class="inp mono" id="ltGioDi" type="time"></label>
    <label class="field"><span class="lbl">Giờ về <span class="req">*</span></span><input class="inp mono" id="ltGioVe" type="time"></label>
    <label class="field"><span class="lbl">Pin % về <span class="req">*</span></span><input class="inp mono" id="ltPin" inputmode="numeric" maxlength="3"></label></div>
  <div style="display:flex;justify-content:space-between;font-size:12px"><span class="muted">Quãng đường</span><span class="mono b" id="ltKm">—</span></div>
  <div class="lt-sec" id="ltCond" style="gap:0"><span class="sect" style="padding-bottom:6px">Tình trạng sau chuyến</span>
    ${[['ngoai', 'Ngoại thất'], ['noi', 'Nội thất'], ['lop', 'Lốp xe'], ['dien', 'Đèn và hệ thống điện']].map(k => `<div class="lt-cond" data-k="${k[0]}"><span>${k[1]}</span><span style="display:flex;gap:4px"><button type="button" class="pill" data-v="Tốt">Tốt</button><button type="button" class="pill" data-v="Có vấn đề">Có vấn đề</button></span></div>`).join('')}
  </div>
  <label class="check" id="ltKyWrap"><input type="checkbox" id="ltKy">Khách đã ký Phiếu yêu cầu và Giấy cam kết <span style="color:var(--bad)">*</span></label>
  <label class="check"><input type="checkbox" id="ltDon">Đã dọn rác và đồ dùng cá nhân</label>
  <label class="check"><input type="checkbox" id="ltSac">Đã cắm sạc</label>
  <label class="field"><span class="lbl">Ghi chú</span><input class="inp" id="ltGhi" maxlength="300"></label>
  <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:8px">
    <button class="btn out" id="ltStartBtn" style="min-height:50px;font-weight:800;letter-spacing:.1em">LƯU ODO ĐI</button>
    <button class="btn pri" id="ltReturnBtn" style="min-height:50px;font-weight:800;letter-spacing:.2em;grid-column:2">TRẢ XE</button></div>
  <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap">
    <button class="btn sm" id="ltLogBtn">Chuyến trước</button><button class="btn sm" id="ltReprint">In lại hồ sơ</button><button class="btn sm" id="ltEditBtn">Sửa phiếu</button><button class="btn sm bad" id="ltCancelBtn">Hủy phiếu</button><button class="btn sm" data-close="ltUseDlg">Đóng</button></div>
</div></div>`;

  window.LT = { mount: mount, load: load };
})();
