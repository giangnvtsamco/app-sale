/* Tab Tờ trình · trang Quản lý App Sale (v1.7)
 * Soạn tờ trình + giấy đề nghị xuất kho + phiếu gửi Phòng Dịch vụ (đặt hàng PK, lắp đặt PK khuyến mãi),
 * xem trước khổ A4, lưu sổ, tạo file Word (Google Docs → tải .docx), nạp danh mục PK từ Excel.
 * Dùng chung: PIN, call, $, $$, esc, toast, busy, openDlg, closeDlg, fileToBase64, shrinkImage (quanly.html + samco-core). */
(() => {
  let T = null, CUR = null, SUB = 'soan', soF = 'all';
  const fm = n => Math.round(Number(n) || 0).toLocaleString('vi-VN');
  const nb = s => Number(String(s == null ? '' : s).replace(/[^\d-]/g, '')) || 0;
  const iso = d => { const m = String(d || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; };
  const vn = v => v ? v.split('-').reverse().join('/') : '';
  const docUrl = id => 'https://docs.google.com/document/d/' + encodeURIComponent(id) + '/edit';
  const docxUrl = id => 'https://docs.google.com/document/d/' + encodeURIComponent(id) + '/export?format=docx';
  const fileUrl = id => 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view';

  /* ---------- Bằng chữ ---------- */
  const CS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function doc3(n, full) {
    const t = Math.floor(n / 100), c = Math.floor(n % 100 / 10), d = n % 10, o = [];
    if (full || t) o.push(CS[t] + ' trăm');
    if (c > 1) { o.push(CS[c] + ' mươi'); if (d === 1) o.push('mốt'); else if (d === 5) o.push('lăm'); else if (d) o.push(CS[d]); }
    else if (c === 1) { o.push('mười'); if (d === 5) o.push('lăm'); else if (d) o.push(CS[d]); }
    else if (d) { if (full || t) o.push('lẻ'); o.push(CS[d]); }
    return o.join(' ');
  }
  function bangChu(n) {
    n = Math.round(n); if (!n) return 'Không đồng';
    const g = []; let x = n; while (x > 0) { g.push(x % 1000); x = Math.floor(x / 1000); }
    const UN = ['', 'ngàn', 'triệu', 'tỷ', 'ngàn tỷ'], o = [];
    for (let i = g.length - 1; i >= 0; i--) { if (!g[i]) continue; o.push(doc3(g[i], i < g.length - 1) + (UN[i] ? ' ' + UN[i] : '')); }
    const s = o.join(' ').replace(/\s+/g, ' ').trim(); return s[0].toUpperCase() + s.slice(1) + ' đồng';
  }
  window.ttBangChu = bangChu; // để kiểm thử

  /* ---------- Loại giấy · cột bảng ---------- */
  const COLS = {
    sp: [['ma', 'Mã SP', 128], ['ten', 'Tên sản phẩm', 0], ['sl', 'SL', 44, 1], ['gia', 'Đơn giá chưa VAT', 100, 1]],
    xk: [['ma', 'Mã SP', 120], ['kho', 'Kho', 66], ['ten', 'Tên sản phẩm', 0], ['sl', 'SL', 44, 1], ['gia', 'Đơn giá chưa VAT', 96, 1]],
    xe: [['bs', 'Biển số', 96], ['hx', 'Hiệu xe', 90], ['nam', 'Năm SX', 52], ['gt', 'Giá trị BH', 104, 1], ['tnds', 'TNDS', 84, 1], ['vcx', 'VCX', 92, 1], ['etag', 'E-Tag', 76, 1]],
    cp: [['nd', 'Nội dung', 0], ['dvt', 'ĐVT', 56], ['sl', 'SL', 44, 1], ['gia', 'Đơn giá trước thuế', 100, 1], ['vat', 'Thuế %', 52, 1]],
    hh: [['ten', 'Tên hàng hóa', 0], ['dvt', 'ĐVT', 70], ['sl', 'Số lượng', 70, 1]],
    ns: [['ten', 'Họ và tên', 0], ['cv', 'Chức vụ', 170]],
    dv: [['ma', 'Mã SP', 120], ['kho', 'Kho', 120], ['ten', 'Tên sản phẩm', 0], ['sl', 'SL', 44, 1], ['gia', 'Giá chưa VAT', 96, 1]],
    kh: [['ten', 'Khách hàng', 0], ['lx', 'Loại xe', 110], ['sk', 'Số khung', 160], ['sdt', 'SĐT khách', 110], ['sale', 'Sale · SĐT', 170]]
  };
  const LOAI = {
    dathang: { cols: 'sp', cap: 'pgd', secs: true, xkOk: true,
      vv: 'Về việc đặt mua phụ kiện trưng bày tại showroom theo tiêu chuẩn của VinFast',
      cc: 'Căn cứ vào Đợt đánh giá đại lý tháng 4/2026 của VinFast và các hạng mục cần điều chỉnh theo yêu cầu của Thanh tra bên VinFast;',
      md: 'Nhằm thực hiện theo yêu cầu tiêu chuẩn của VinFast về phụ kiện trưng bày tại showroom, {nguoi} kính trình {cap} duyệt chi phí đặt hàng như sau:' },
    baohiem: { cols: 'xe', cap: 'pgd',
      vv: 'Về việc mua bảo hiểm và đăng ký dịch vụ thu phí tự động không dừng (ETC) cho xe lái thử VF8 tại Chi nhánh SAMCO Bình Tân',
      cc: 'Căn cứ nhu cầu vận hành, di chuyển và phục vụ công tác lái thử xe ô tô của khách hàng tại Chi nhánh SAMCO Bình Tân.',
      md: 'Nhằm đảm bảo an toàn tài sản, hạn chế rủi ro trong quá trình vận hành, đồng thời giúp việc di chuyển qua các trạm thu phí được thuận tiện, nhanh chóng, {nguoi} kính trình {cap} xem xét, phê duyệt chi tiết như sau:' },
    chiphi: { cols: 'cp', cap: 'pgd', dk: 'Bảng báo giá',
      vv: 'Về việc xin chi phí …', cc: '',
      md: 'Nhằm mục đích phục vụ công tác truyền thông, quảng bá hình ảnh và giới thiệu các dòng xe Ô tô VinFast, {nguoi} kính trình {cap} xem xét, phê duyệt chi phí như sau:' },
    xuatnb: { cols: 'hh', cap: 'pgd', xkOk: true,
      vv: 'Về việc sử dụng … cho Chương trình …',
      cc: 'Căn cứ thông báo và danh sách xác nhận từ phía đối tác VinFast về việc tổ chức Chương trình … dành cho các Đại lý Phân phối;',
      md: 'Nhằm chuẩn bị … cho CBNV tham gia Chương trình …, {nguoi} đề xuất {cap} duyệt xuất kho cụ thể như sau:' },
    cunguoi: { cols: 'ns', cap: 'pgd',
      vv: 'Về việc cử CB-CNV tham dự Chương trình …',
      cc: 'Căn cứ thông báo và danh sách xác nhận từ phía đối tác VinFast về việc tổ chức Chương trình … dành cho các Đại lý Phân phối;',
      md: 'Nhằm tạo điều kiện cho cán bộ nhân viên giao lưu, học hỏi và gắn kết theo định hướng của VinFast, {nguoi} kính trình {cap} cho các nhân sự có tên trong danh sách sau tham dự chương trình:',
      kt: 'Thời gian: … Địa điểm: …' },
    xuatkho: { cols: 'xk', cap: '', xk: true, vv: '', cc: '', md: '' },
    // phiếu gửi Phòng Dịch vụ (v1.7) · nhãn ô nhập riêng: f = { vv, cc, md, kt } (null = ẩn)
    dhdv: { cols: 'dv', cap: '', dv: true, goc: true, vv: 'Đặt hàng phụ kiện', cc: 'Phòng bán hàng xe mới (chi phí nội bộ)', md: '', kt: 'Nhờ Phòng Dịch vụ đặt hàng giúp. Đính kèm tờ trình.',
      f: { vv: 'Tên phiếu · ghi trong sổ, không in', cc: 'Chi phí trên được tính cho', md: null, kt: 'Ghi chú' } },
    lapdat: { cols: 'kh', cap: '', dv: true, vv: 'Đặt hàng và lắp đặt … cho xe …',
      md: 'Theo Chương trình ưu đãi tặng … dành cho khách hàng mua xe VinFast … tại showroom VinFast SAMCO Bình Tân. Phòng Bán hàng đề nghị Phòng Dịch vụ tiếp nhận thông tin, hỗ trợ đặt hàng và tiến hành lắp đặt … cho các khách hàng theo danh sách dưới đây:',
      cc: 'Khách hàng thanh toán bằng E-Voucher (giá trị … VNĐ)', kt: '{phoiHop}',
      f: { vv: 'V/v · in dưới tiêu đề', cc: '1. Hình thức thanh toán', md: 'Đoạn mở đầu', kt: '2. Đề nghị phối hợp' } }
  };
  const F0 = { vv: 'Về việc', cc: 'Căn cứ riêng · mỗi dòng một căn cứ', md: 'Đoạn mở đầu · {nguoi} {cap} tự thay', kt: 'Câu thêm trước lời kết' };
  const khongSo = loai => !!(LOAI[loai] && (LOAI[loai].xk || LOAI[loai].dv));
  const TT_CHIP = { 'Nháp': 'mute', 'Đã trình': 'warn', 'Đã duyệt': 'acc', 'Đã xuất kho': 'ok', 'Hủy': 'bad' };
  const tinh = (cot, r) => cot === 'sp' || cot === 'xk' || cot === 'dv' ? (r.sl || 0) * (r.gia || 0)
    : cot === 'cp' ? Math.round((r.sl || 0) * (r.gia || 0) * (1 + (r.vat || 0) / 100))
    : cot === 'xe' ? (r.tnds || 0) + (r.vcx || 0) + (r.etag || 0) : 0;
  const capOf = ma => T.cap.find(c => c.ma === ma) || T.cap[0] || { ten: '', kg: '', cc: [], ky: [], nguoi: '', so: 'TTr-KD', dv: '' };
  const capTen = c => String(c.ten || '').replace(/\s*\(.*\)\s*$/, '');
  const soHieu = r => khongSo(r.loai) ? '' : (r.so ? r.so + '/' + capOf(r.cap).so : '');

  /* ---------- Tải dữ liệu ---------- */
  async function ttLoad() {
    if (T) return drawAll();
    $('#ttBody').innerHTML = '<div class="loading"><span class="spin"></span>Đang tải…</div>';
    try {
      T = await call('ttInit', PIN);
      $('#ttBody').innerHTML = '';
      $('#ttSoanBox').hidden = false;
      fillStatic();
      if (!CUR) blank('dathang');
      drawAll();
    } catch (e) {
      if (/PIN/.test(String(e))) { try { sessionStorage.removeItem('appsale_admin'); } catch (x) {} toast(e, 1); return showLogin(); }
      $('#ttBody').innerHTML = `<div class="empty">${esc(e)}</div>`;
    }
  }
  window.ttOpen = ttLoad;

  function fillStatic() {
    $('#ttTypes').innerHTML = Object.keys(LOAI).map(k => `<button class="pill" type="button" data-l="${k}">${esc(T.loai[k])}</button>`).join('');
    $('#ttCap').innerHTML = T.cap.map(c => `<option value="${esc(c.ma)}">${esc(c.ten)}</option>`).join('');
    $('#ttDm').innerHTML = T.dm.map(p => `<option value="${esc(p.ma)}">${esc(p.ten)} · ${fm(p.gia)}</option>`).join('');
  }
  function drawAll() {
    $$('#ttSub .pill').forEach(p => p.classList.toggle('on', p.dataset.s === SUB));
    $('#ttSoan').hidden = SUB !== 'soan'; $('#ttSo').hidden = SUB !== 'so';
    $('#ttSub [data-s="so"]').textContent = 'Sổ tờ trình · ' + T.list.length;
    if (SUB === 'soan') drawForm(); else drawSo();
  }
  $('#ttSub').onclick = e => { const p = e.target.closest('.pill'); if (!p || !T) return; SUB = p.dataset.s; drawAll(); };

  /* ---------- Soạn ---------- */
  function blank(loai) {
    const L = LOAI[loai];
    CUR = { id: null, loai, cap: L.cap || '', so: '', ngay: '', vv: L.vv, cc: L.cc || '', md: L.md || '', dk: L.dk || '', kt: (L.kt || '').replace('{phoiHop}', (T.pdv || {}).phoiHop || ''), goc: '', tt: 'Nháp', word: '', ky: '',
      data: [{ sec: '', rows: [{}] }] };
    if (L.xk || L.dv) { const d = new Date(), z = n => String(n).padStart(2, '0'); CUR.ngay = d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  }
  function drawForm() {
    const L = LOAI[CUR.loai], xk = !!L.xk, dv = !!L.dv, F = L.f || F0;
    $$('#ttTypes .pill').forEach(p => { p.classList.toggle('on', p.dataset.l === CUR.loai); p.disabled = !!CUR.id && p.dataset.l !== CUR.loai; });
    $('#ttState').innerHTML = CUR.id
      ? `<span class="chip ${TT_CHIP[CUR.tt] || 'mute'}">${esc(CUR.tt)}</span> <span class="mono small">${esc(CUR.id)}</span>${CUR.word ? ` · <a href="${docUrl(CUR.word)}" target="_blank" rel="noopener">Mở Google Docs ↗</a> · <a href="${docxUrl(CUR.word)}" target="_blank" rel="noopener">Tải Word (.docx)</a>` : ''}`
      : '<span class="chip mute">Giấy mới · chưa lưu</span>';
    $('#ttCapBox').hidden = xk || dv; $('#ttGocBox').hidden = !(xk || L.goc);
    $('#ttCcBox').hidden = xk || F.cc === null; $('#ttMdBox').hidden = xk || F.md === null; $('#ttSoBox').hidden = xk || dv;
    $('#ttDkBox').hidden = dv; $('#ttXeBox').hidden = CUR.loai !== 'lapdat';
    // phiếu P.DV: ô "chi phí tính cho" / "hình thức thanh toán" in sau bảng → đưa xuống mục 5 cho đúng thứ tự
    if (dv) $('#ttL_kt').closest('.field').before($('#ttCcBox')); else $('#ttMdBox').before($('#ttCcBox'));
    $('#ttTblHint').textContent = CUR.loai === 'lapdat' ? 'Tìm xe ở ô trên để điền sẵn, hoặc gõ tay vào bảng.' : 'Gõ mã SP có trong _DanhMucPK là tự điền tên, giá' + (CUR.loai === 'dhdv' ? ', kho' : '') + '. Mã chưa có thì gõ tay.';
    ['vv', 'cc', 'md', 'kt'].forEach(k => { if (F[k]) $('#ttL_' + k).textContent = F[k]; });
    $('#ttGocH').textContent = L.goc ? '2 · Căn cứ tờ trình (không bắt buộc)' : '2 · Căn cứ tờ trình';
    $('#ttGocHint').textContent = L.goc ? 'Chọn tờ trình đặt hàng: app chép danh sách phụ kiện. Đặt lẻ thì bỏ qua, gõ mã SP ở bảng.' : 'Chọn tờ trình đã duyệt: app chép danh mục sản phẩm và câu căn cứ.';
    $('#ttCap').value = CUR.cap; $('#ttCapNote').textContent = xk || dv ? '' : capOf(CUR.cap).note || '';
    if (xk || L.goc) {
      const ds = T.list.filter(r => (L.goc ? r.loai === 'dathang' : LOAI[r.loai] && LOAI[r.loai].xkOk) && r.tt !== 'Hủy');
      $('#ttGoc').innerHTML = '<option value="">' + (L.goc ? '— Không căn cứ tờ trình —' : '— Chọn tờ trình đã duyệt —') + '</option>' + ds.map(r => `<option value="${esc(r.id)}"${r.id === CUR.goc ? ' selected' : ''}>${esc(soHieu(r) || r.id)} · ${esc(String(r.vv).replace(/^Về việc\s*/i, ''))}</option>`).join('');
    }
    ['vv', 'cc', 'md', 'so', 'dk', 'kt'].forEach(k => { $('#tt_' + k).value = CUR[k] || ''; });
    $('#tt_ngay').value = CUR.ngay || '';
    $('#ttAddSec').hidden = !L.secs;
    drawTable();
  }
  function drawTable() {
    const L = LOAI[CUR.loai], C = COLS[L.cols];
    let h = '';
    CUR.data.forEach((s, si) => {
      if (L.secs) h += `<div class="ttsec"><span class="lbl">Mục ${si + 1}</span><input class="inp" data-sec="${si}" value="${esc(s.sec)}" placeholder="Tên mục · để trống nếu chỉ có 1 bảng">${CUR.data.length > 1 ? `<button class="btn sm" type="button" data-delsec="${si}" title="Bỏ mục">✕</button>` : ''}</div>`;
      const minW = 24 + 34 + C.reduce((t, c) => t + (c[2] || 130), 0);
      h += `<div class="tbl-wrap"><table class="tbl tted" style="min-width:${minW}px"><thead><tr><th style="width:24px">#</th>` + C.map(c => `<th${c[2] ? ` style="width:${c[2]}px"` : ''}>${c[1]}</th>`).join('') + '<th style="width:34px"></th></tr></thead><tbody>' +
        s.rows.map((r, ri) => `<tr><td class="muted small">${ri + 1}</td>` + C.map(c => {
          const v = r[c[0]];
          return `<td><input class="inp${c[3] ? ' mono' : ''}" data-s="${si}" data-r="${ri}" data-k="${c[0]}" value="${esc(c[3] ? (v ? fm(v) : '') : (v == null ? '' : v))}"${c[3] ? ' inputmode="numeric" style="text-align:right"' : ''}${c[0] === 'ma' ? ' list="ttDm" autocomplete="off"' : ''}></td>`;
        }).join('') + `<td><button class="btn sm" type="button" data-s="${si}" data-del="${ri}" title="Bỏ dòng">✕</button></td></tr>`).join('') +
        '</tbody></table></div>';
    });
    $('#ttTbl').innerHTML = h;
    preview();
  }
  // nhập liệu: cập nhật CUR và trang A4, chỉ vẽ lại bảng khi cần (giữ con trỏ)
  $('#ttTbl').addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.sec != null) { CUR.data[+t.dataset.sec].sec = t.value; return preview(); }
    if (t.dataset.k == null) return;
    const C = COLS[LOAI[CUR.loai].cols].find(c => c[0] === t.dataset.k), r = CUR.data[+t.dataset.s].rows[+t.dataset.r];
    if (C[3]) { r[C[0]] = nb(t.value); if (t.dataset.k === 'vat') r.vat = Number(String(t.value).replace(',', '.').replace(/[^\d.]/g, '')) || 0; }
    else r[C[0]] = t.value;
    if (t.dataset.k === 'ma') {
      const p = T.dm.find(x => x.ma.toUpperCase() === t.value.trim().toUpperCase());
      if (p) { r.ma = p.ma; r.ten = p.ten; r.gia = p.gia; r.sl = r.sl || 1; if (CUR.loai === 'xuatkho') r.kho = r.kho || p.kho; if (CUR.loai === 'dhdv') r.kho = r.kho || p.vt || 'Kho PK 4036/1000'; return drawTable(); }
    }
    preview();
  });
  $('#ttTbl').addEventListener('change', e => { const t = e.target; if (t.classList.contains('mono') && t.dataset.k && t.dataset.k !== 'vat') t.value = nb(t.value) ? fm(nb(t.value)) : ''; });
  $('#ttTbl').addEventListener('click', e => {
    const d = e.target.closest('[data-del]'); if (d) { CUR.data[+d.dataset.s].rows.splice(+d.dataset.del, 1); if (!CUR.data[+d.dataset.s].rows.length) CUR.data[+d.dataset.s].rows.push({}); return drawTable(); }
    const ds = e.target.closest('[data-delsec]'); if (ds) { CUR.data.splice(+ds.dataset.delsec, 1); return drawTable(); }
  });
  $('#ttAddRow').onclick = () => { CUR.data[CUR.data.length - 1].rows.push({}); drawTable(); const ins = $$('#ttTbl tbody tr:last-child input'); if (ins.length) ins[ins.length - 1].closest('tr').querySelector('input').focus(); };
  $('#ttAddSec').onclick = () => { CUR.data.push({ sec: '', rows: [{}] }); drawTable(); };
  $('#ttTypes').onclick = e => {
    const b = e.target.closest('.pill'); if (!b || b.disabled || CUR.id || b.dataset.l === CUR.loai) return;
    blank(b.dataset.l); drawForm();
  };
  $('#ttCap').onchange = () => { CUR.cap = $('#ttCap').value; $('#ttCapNote').textContent = capOf(CUR.cap).note || ''; preview(); };
  ['vv', 'cc', 'md', 'so', 'dk', 'kt', 'ngay'].forEach(k => $('#tt_' + k).addEventListener('input', () => { CUR[k] = $('#tt_' + k).value; preview(); }));
  $('#ttGoc').onchange = () => loadGoc($('#ttGoc').value);
  $('#ttNew').onclick = () => { blank(CUR && !CUR.id ? CUR.loai : 'dathang'); SUB = 'soan'; drawAll(); };

  /** Giấy xuất kho từ tờ trình đã duyệt: chép danh mục sản phẩm, câu căn cứ */
  async function loadGoc(id) {
    CUR.goc = id;
    if (!id) { CUR.vv = LOAI[CUR.loai].goc ? LOAI[CUR.loai].vv : ''; CUR.data = [{ sec: '', rows: [{}] }]; return drawForm(); }
    try {
      const g = await call('ttGet', PIN, id);
      const r = T.list.find(x => x.id === id) || g;
      if (CUR.loai === 'dhdv') { // phiếu đặt hàng gửi P.DV: chép phụ kiện của tờ trình
        CUR.vv = 'Đặt hàng phụ kiện theo Tờ trình ' + (soHieu(r) || r.id);
        CUR.data = [{ sec: '', rows: [].concat(...(g.data || []).map(s => s.rows)).filter(x => x.ma || x.ten).map(x => {
          const p = T.dm.find(d => d.ma === x.ma);
          return { ma: x.ma || '', kho: p && p.vt ? p.vt : 'Kho PK 4036/1000', ten: x.ten || '', sl: x.sl || 0, gia: x.gia || 0 };
        }) }];
        if (!CUR.data[0].rows.length) CUR.data[0].rows.push({});
        return drawForm();
      }
      const vv = String(g.vv || '').replace(/^Về việc\s*/i, '');
      CUR.vv = 'Căn cứ vào Tờ trình Số ' + (soHieu(r) || '……/' + capOf(g.cap).so) + ' Về việc ' + vv.charAt(0).toLowerCase() + vv.slice(1) +
        (g.ngay ? ', ngày ' + g.ngay : '') + ' của ' + (capOf(g.cap).dv || 'PHÒNG KINH DOANH') + '.';
      CUR.data = [{ sec: '', rows: [].concat(...(g.data || []).map(s => s.rows)).map(x => {
        const p = T.dm.find(d => d.ma === x.ma);
        return { ma: x.ma || '', kho: p ? p.kho : 'KPKIEN', ten: x.ten || '', sl: x.sl || 0, gia: x.gia || 0 };
      }) }];
      if (!CUR.data[0].rows.length) CUR.data[0].rows.push({});
      drawForm();
    } catch (e) { toast(e, 1); }
  }

  /* ---------- Trang A4 (cùng 1 mã cho xem trước và file Word) ---------- */
  const S = {
    p: 'margin:3pt 0;text-align:justify;text-indent:1.27cm;line-height:1.35;font-size:13pt',
    p0: 'margin:3pt 0;text-align:justify;line-height:1.35;font-size:13pt',
    td: 'border:1px solid #000;padding:2pt 4pt;font-size:12pt;vertical-align:top',
    th: 'border:1px solid #000;padding:2pt 4pt;font-size:12pt;text-align:center;font-weight:bold',
    hd: 'text-align:center;vertical-align:top;font-size:12pt;line-height:1.25;padding:0'
  };
  const P = (t, st) => `<p style="${st || S.p}">${t}</p>`;
  const LINE = '<div style="text-align:center;line-height:.6;font-size:12pt;margin:2pt 0 0">—————</div>';
  function ngayChu(v) {
    const d = v ? v.split('-') : null;
    return d ? `ngày ${+d[2]} tháng ${String(d[1]).padStart(2, '0')} năm ${d[0]}` : `ngày&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tháng&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;năm ${new Date().getFullYear()}`;
  }
  /* Phiếu gửi Phòng Dịch vụ: đúng mẫu "Dịch vụ_Lệnh sửa chữa" (trang 4: đặt hàng PK · trang 5: lắp đặt PK khuyến mãi) */
  function a4Dv() {
    const L = LOAI[CUR.loai], W = [], f12 = 'font-size:12pt;line-height:1.35;margin:3pt 0;text-align:justify';
    const td = `style="${S.td};text-align:center;vertical-align:middle"`, tdl = `style="${S.td};vertical-align:middle"`;
    let h = `<table style="border-collapse:collapse"><tr><td style="text-align:center;font-size:10.5pt;font-weight:bold;line-height:1.3;padding:0">NHÀ MÁY Ô TÔ THƯƠNG MẠI SAMCO<br>VINFAST – SAMCO BÌNH TÂN</td></tr>
      <tr><td style="text-align:center;font-size:10.5pt;padding:8pt 0 0"><u>PHÒNG BÁN HÀNG</u></td></tr></table>`;
    const rows = CUR.data[0].rows.filter(r => Object.keys(r).some(k => r[k] !== '' && r[k] !== 0 && r[k] != null));
    let G = 0;
    if (CUR.loai === 'dhdv') {
      h += `<p style="text-align:center;font-size:14pt;font-weight:bold;margin:12pt 0 4pt">PHIẾU ĐỀ NGHỊ DỊCH VỤ ĐẶT HÀNG PHỤ KIỆN</p>`;
      h += `<p style="${f12}"><b><u>Kính gửi:</u> - Phòng Dịch vụ VINFAST SAMCO BÌNH TÂN</b></p><p style="${f12}">Phòng bán hàng đề nghị được hỗ trợ phần dịch vụ đặt những phụ kiện sau:</p>`;
      h += `<table style="width:100%;border-collapse:collapse;margin:4pt 0"><tr>${['Mã SP', 'Kho', 'Tên sản phẩm', 'Số lượng', 'Giá chưa VAT'].map(x => `<th style="${S.th}">${x}</th>`).join('')}</tr>`;
      rows.forEach(r => {
        const t = tinh('dv', r); G += t;
        h += `<tr><td ${td}>${esc(r.ma || '')}</td><td ${td}>${esc(r.kho || '')}</td><td ${td}>${esc(r.ten || '')}</td><td ${td}>${r.sl || ''}</td><td ${td}>${fm(r.gia)}</td></tr>`;
        const p = T.dm.find(x => x.ma === r.ma); if (p && r.gia && p.gia !== r.gia) W.push(`${r.ma} ${r.ten || ''}: đang ghi ${fm(r.gia)}, danh mục ${fm(p.gia)}.`);
        if ((r.sl || 0) > 1) W.push(`${r.ma || r.ten}: SL ${r.sl} · Giá chưa VAT in theo đơn giá, tổng cộng tính SL × giá.`);
      });
      if (!rows.length) h += `<tr><td colspan="5" ${td}>&nbsp;</td></tr>`;
      if (rows.length > 1) h += `<tr><td colspan="4" style="${S.td};text-align:center;font-weight:bold">TỔNG CỘNG (CHƯA VAT)</td><td ${td.replace('center', 'center;font-weight:bold')}>${fm(G)}</td></tr>`;
      h += '</table>';
      h += `<p style="${f12};margin-top:10pt"><b>Chi phí trên được tính cho:</b> ${esc(CUR.cc)}</p>`;
      if (CUR.kt) h += `<p style="${f12}">Ghi chú: ${esc(CUR.kt)}</p>`;
    } else {
      h += `<p style="text-align:center;font-size:14pt;font-weight:bold;margin:12pt 0 2pt">PHIẾU ĐỀ NGHỊ DỊCH VỤ</p>`;
      if (CUR.vv) h += `<p style="text-align:center;font-size:13pt;font-style:italic;margin:0 0 6pt">(V/v: ${esc(String(CUR.vv).replace(/^\(?\s*V\/v:?\s*/i, '').replace(/\)\s*$/, ''))})</p>`;
      h += `<p style="${f12}"><b><u>Kính gửi:</u> Phòng Dịch vụ VINFAST SAMCO BÌNH TÂN</b></p>`;
      if (CUR.md) h += `<p style="${f12};text-indent:1.27cm">${esc(CUR.md)}</p>`;
      h += `<table style="width:100%;border-collapse:collapse;margin:4pt 0"><tr>${['STT', 'Khách hàng', 'Loại xe', 'Số Khung', 'SĐT', 'Sale'].map(x => `<th style="${S.th}">${x}</th>`).join('')}</tr>`;
      rows.forEach((r, i) => {
        h += `<tr><td ${td}>${i + 1}</td><td ${td}>${esc(String(r.ten || '').toUpperCase())}</td><td ${td}>${esc(r.lx || '')}</td><td ${td}>${esc(r.sk || '')}</td><td ${td}>${esc(r.sdt || '')}</td><td ${td}>${esc(r.sale || '').replace(/\s*·\s*/g, '<br>')}</td></tr>`;
        if (!r.sk) W.push(`Dòng ${i + 1}: chưa có số khung.`);
      });
      if (!rows.length) h += `<tr><td colspan="6" ${td}>&nbsp;</td></tr>`;
      h += '</table>';
      if (CUR.cc) h += `<p style="${f12};margin-top:10pt"><b>1. Hình thức thanh toán:</b> ${esc(CUR.cc)}</p>`;
      if (CUR.kt) h += `<p style="${f12}"><b>2. Đề nghị phối hợp:</b> ${esc(CUR.kt)}</p>`;
      h += `<p style="${f12};margin-top:8pt">Trân trọng cảm ơn sự hỗ trợ của Phòng Dịch vụ!</p>`;
      if (/…/.test(CUR.vv + CUR.md + CUR.cc + CUR.kt)) W.push('Còn chỗ "…" chưa điền (tên phụ kiện, dòng xe, giá trị E-Voucher, hạn hoàn thành).');
    }
    const d = CUR.ngay ? CUR.ngay.split('-') : null;
    h += `<p style="text-align:right;font-style:italic;font-size:11pt;margin:10pt 0 0">TP.HCM, ${d ? `ngày ${+d[2]} tháng ${+d[1]} năm ${d[0]}` : 'ngày … tháng … năm ' + new Date().getFullYear()}</p>`;
    h += `<table style="width:100%;border-collapse:collapse;margin-top:2pt"><tr>${[['Xác nhận P.Dịch Vụ', 1], ['Xác nhận P.Bán Hàng', 0], ['Nhân viên đề nghị', 0]].map(k => `<td style="text-align:center;vertical-align:top;font-size:12pt;${k[1] ? 'font-weight:bold;' : ''}padding:0 2pt;width:33%">${k[0]}</td>`).join('')}</tr></table>` +
      '<p style="margin:0;line-height:1">&nbsp;</p>'.repeat(5);
    return { html: h, tong: G, tien: CUR.loai === 'dhdv', warn: W };
  }
  function a4() {
    if (LOAI[CUR.loai].dv) return a4Dv();
    const L = LOAI[CUR.loai], xk = !!L.xk, c = capOf(CUR.cap), cot = L.cols, W = [];
    const tct = xk || !c.dv;
    const left = (tct ? 'TỔNG CÔNG TY<br><span style="white-space:nowrap">CƠ KHÍ GIAO THÔNG VẬN TẢI SÀI GÒN</span><br>TNHH MỘT THÀNH VIÊN<br>(SAMCO)<br>' : '') +
      '<b style="white-space:nowrap">NHÀ MÁY Ô TÔ THƯƠNG MẠI SAMCO</b><br><b>(SAMCO BÌNH TÂN)</b>' + (!xk && c.dv ? '<br><b>' + esc(c.dv) + '</b>' : '') + LINE;
    const right = '<b style="white-space:nowrap">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập - Tự do - Hạnh phúc</b>' + LINE;
    let h = `<table style="width:100%;border-collapse:collapse"><tr><td style="${S.hd};width:47%;font-size:11.5pt">${left}</td><td style="${S.hd}">${right}</td></tr>`;
    if (!xk) h += `<tr><td style="${S.hd};padding-top:6pt">Số: ${esc(CUR.so) || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}/${esc(c.so)}</td><td style="${S.hd};padding-top:6pt"><i>Thành phố Hồ Chí Minh, ${ngayChu(CUR.ngay)}</i></td></tr>`;
    h += '</table>';
    const md = esc(CUR.md || '').replace(/\{nguoi\}/g, esc(c.nguoi)).replace(/\{cap\}/g, esc(capTen(c)));
    if (!xk) {
      h += `<p style="text-align:center;font-size:15pt;font-weight:bold;margin:20pt 0 0">TỜ TRÌNH</p><p style="text-align:center;font-weight:bold;font-size:13pt;margin:0 0 8pt">${esc(CUR.vv)}</p>`;
      h += `<p style="text-align:center;font-size:13pt;margin:6pt 0 8pt">Kính gửi: ${esc(c.kg)}.</p>`;
      h += [...c.cc, ...String(CUR.cc || '').split('\n').map(s => s.trim()).filter(Boolean)].map(x => P(esc(x))).join('') + (md ? P(md) : '');
    } else {
      h += `<p style="text-align:center;font-size:15pt;font-weight:bold;margin:20pt 0 10pt">GIẤY ĐỀ NGHỊ XUẤT KHO</p>`;
      h += P('Kính gửi:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Ban Giám Đốc SAMCO Bình Tân;<br>&nbsp;&nbsp;&nbsp;&nbsp;- Phòng Tài chính Kế toán.', S.p0) + P(esc(CUR.vv));
      h += P(`Họ và tên người đề nghị: ${esc(T.nguoi.ten)}<br>Bộ phận: ${esc(T.nguoi.bp)}<br>Đề nghị xuất kho với thông tin theo danh mục sau:`, S.p0);
      const g = T.list.find(x => x.id === CUR.goc);
      if (!CUR.goc) W.push('Chưa chọn tờ trình căn cứ.');
      else if (g && !g.so) W.push('Tờ trình căn cứ chưa có số. Ghi số ở Sổ tờ trình rồi chọn lại.');
    }
    let G = 0;
    const tien = ['sp', 'xe', 'cp'].includes(cot);
    CUR.data.forEach((s, si) => {
      const rows = s.rows.filter(r => Object.keys(r).some(k => r[k] !== '' && r[k] !== 0 && r[k] != null));
      if (s.sec) h += P(`<b>${si + 1}. ${esc(s.sec)}:</b>`, S.p0);
      const th = { sp: ['STT', 'Mã SP', 'Tên sản phẩm', 'SL', 'Đơn giá chưa VAT', 'Thành tiền chưa VAT'], xk: ['STT', 'Mã SP', 'Kho', 'Tên sản phẩm', 'SL', 'Đơn giá chưa VAT', 'Thành tiền chưa VAT'],
        xe: ['TT', 'Biển số', 'Hiệu xe', 'Năm SX', 'Giá trị bảo hiểm', 'TNDS', 'VCX', 'E-Tag VETC', 'Tổng phí'], cp: ['STT', 'Nội dung', 'ĐVT', 'SL', 'Trước thuế', 'Thuế GTGT', 'Sau thuế'],
        hh: ['STT', 'Tên hàng hóa', 'Đơn vị tính', 'Số lượng'], ns: ['STT', 'Họ và tên', 'Chức vụ'] }[cot];
      const n = `style="${S.td};text-align:right;white-space:nowrap"`, ce = `style="${S.td};text-align:center"`, td = `style="${S.td}"`;
      h += `<table style="width:100%;border-collapse:collapse;margin:4pt 0"><tr>${th.map(x => `<th style="${S.th}">${x}</th>`).join('')}</tr>`;
      let tot = 0;
      rows.forEach((r, i) => {
        const t = tinh(cot, r); tot += t;
        const e = k => esc(r[k] == null ? '' : r[k]);
        if (cot === 'sp' || cot === 'xk') {
          h += `<tr><td ${ce}>${i + 1}</td><td ${td}>${e('ma')}</td>${cot === 'xk' ? `<td ${ce}>${e('kho')}</td>` : ''}<td ${td}>${e('ten')}</td><td ${ce}>${r.sl || ''}</td><td ${n}>${fm(r.gia)}</td><td ${n}>${fm(t)}</td></tr>`;
          const p = T.dm.find(x => x.ma === r.ma); if (p && r.gia && p.gia !== r.gia) W.push(`${r.ma} ${r.ten || ''}: đang ghi ${fm(r.gia)}, danh mục ${fm(p.gia)}.`);
        } else if (cot === 'xe') {
          h += `<tr><td ${ce}>${i + 1}</td><td ${td}>${e('bs')}</td><td ${td}>${e('hx')}</td><td ${ce}>${e('nam')}</td><td ${n}>${fm(r.gt)}</td><td ${n}>${fm(r.tnds)}</td><td ${n}>${fm(r.vcx)}</td><td ${n}>${fm(r.etag)}</td><td ${n}>${fm(t)}</td></tr>`;
          if (r.gt && r.vcx && r.vcx < 4500000) W.push(`${r.bs || 'Xe ' + (i + 1)}: VCX thấp hơn mức tối thiểu 4.500.000.`);
        } else if (cot === 'cp') {
          h += `<tr><td ${ce}>${i + 1}</td><td ${td}>${e('nd')}</td><td ${ce}>${e('dvt')}</td><td ${ce}>${r.sl || ''}</td><td ${n}>${fm((r.sl || 0) * (r.gia || 0))}</td><td ${ce}>${String(r.vat || 0).replace('.', ',')}%</td><td ${n}>${fm(t)}</td></tr>`;
        } else if (cot === 'hh') h += `<tr><td ${ce}>${i + 1}</td><td ${td}>${e('ten')}</td><td ${ce}>${e('dvt')}</td><td ${ce}>${r.sl || ''}</td></tr>`;
        else h += `<tr><td ${ce}>${i + 1}</td><td ${td}>${esc(String(r.ten || '').toUpperCase())}</td><td ${td}>${e('cv')}</td></tr>`;
      });
      if (!rows.length) h += `<tr><td colspan="${th.length}" ${ce}>&nbsp;</td></tr>`;
      if (tien) h += `<tr><td colspan="${th.length - 1}" style="${S.td};font-weight:bold;text-align:center">TỔNG CỘNG (${cot === 'sp' ? 'CHƯA VAT' : 'ĐÃ GỒM VAT'})</td><td ${n.replace('nowrap', 'nowrap;font-weight:bold')}>${fm(tot)}</td></tr>`;
      h += '</table>';
      if (tien) h += P(`<i>(Bằng chữ: ${bangChu(tot)}./.)</i>`, S.p0);
      G += tot;
    });
    if (CUR.dk) h += P(`<i>(Đính kèm: ${esc(CUR.dk)})</i>`, S.p0);
    if (CUR.kt) h += P(esc(CUR.kt));
    const sig = list => `<table style="width:100%;border-collapse:collapse;margin-top:14pt"><tr>${list.map(k => `<td style="text-align:center;vertical-align:top;font-weight:bold;font-size:12.5pt;padding:0 2pt">${esc(k[0])}${k[1] ? `<br><i style="font-weight:normal">${esc(k[1])}</i>` : ''}</td>`).join('')}</tr></table><p style="margin:0;line-height:1">&nbsp;</p><p style="margin:0;line-height:1">&nbsp;</p><p style="margin:0;line-height:1">&nbsp;</p><p style="margin:0;line-height:1">&nbsp;</p>`;
    if (!xk) {
      h += P(`Kính trình ${esc(capTen(c))} xem xét và phê duyệt./.`) + sig(c.ky);
      h += `<p style="margin:12pt 0 0;font-size:11pt;line-height:1.3"><b><i>Nơi nhận:</i></b><br>- Như trên;<br>- P. TCKT;<br>- Lưu: VT, P.KD (1b), G.1.</p>`;
    } else {
      h += `<p style="text-align:right;font-style:italic;font-size:13pt;margin:10pt 0 0">TP. Hồ Chí Minh, ${ngayChu(CUR.ngay)}</p>` + sig([['DUYỆT', ''], ['P. KẾ TOÁN', ''], ['TP. KINH DOANH', ''], ['ĐỀ NGHỊ', '']]);
    }
    return { html: h, tong: G, tien, warn: W };
  }
  function preview() {
    if (!CUR) return;
    const r = a4();
    $('#ttA4').innerHTML = r.html;
    fitA4();
    $('#ttSum').innerHTML = r.tien ? `<div class="kv"><span>Tổng</span><b class="mono">${fm(r.tong)} đ</b></div><div class="small muted">${bangChu(r.tong)}</div>` : '';
    $('#ttSum').hidden = !r.tien;
    $('#ttWarn').innerHTML = [...new Set(r.warn)].map(w => `<div class="small" style="color:var(--warn)">⚠ ${esc(w)}</div>`).join('');
  }

  // thu nhỏ trang A4 vừa khung xem trước
  function fitA4() { const w = $('#ttA4').parentElement.clientWidth - 24; $('#ttA4').style.zoom = w > 0 ? Math.min(1, w / 794) : 1; }
  window.addEventListener('resize', () => { if (CUR && !$('#vToTrinh').hidden) fitA4(); });

  /* ---------- Lưu · Word · In ---------- */
  function payload() {
    return { loai: CUR.loai, cap: CUR.cap, so: CUR.so, ngay: vn(CUR.ngay), vv: CUR.vv, cc: CUR.cc, md: CUR.md, dk: CUR.dk, kt: CUR.kt, goc: CUR.goc,
      data: CUR.data.map(s => ({ sec: s.sec, rows: s.rows.filter(r => Object.keys(r).some(k => r[k] !== '' && r[k] !== 0 && r[k] != null)) })) };
  }
  async function save() {
    const r = await call('ttSave', PIN, payload(), CUR.id || '');
    CUR.id = r.id; T.list = r.list;
    const x = T.list.find(y => y.id === r.id); if (x) { CUR.tt = x.tt; CUR.word = x.word; }
    return r;
  }
  $('#ttSave').onclick = () => busy($('#ttSave'), 'Đang lưu', async () => {
    try { const n = !CUR.id; await save(); toast(n ? 'Đã lưu vào sổ · ' + CUR.id : 'Đã lưu'); drawAll(); } catch (e) { toast(e, 1); }
  });
  $('#ttWord').onclick = () => busy($('#ttWord'), 'Đang tạo file', async () => {
    try {
      await save();
      const r = await call('ttDoc', PIN, CUR.id, a4().html);
      T.list = r.list; CUR.word = r.word; drawAll();
      toast('Đã tạo file Word · bấm "Mở Google Docs" hoặc "Tải Word"');
    } catch (e) { toast(e, 1); }
  });
  $('#ttPrint').onclick = () => {
    const w = window.open('', '_blank');
    if (!w) return toast('Trình duyệt đang chặn cửa sổ mới. Vui lòng cho phép rồi bấm lại.', 1);
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(CUR.vv || 'Tờ trình') + '</title><style>@page{size:A4;margin:20mm 20mm 20mm 30mm}body{margin:0;font-family:"Times New Roman",Times,serif;font-size:13pt;color:#000}</style></head><body>' + a4().html + '</body></html>');
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
  };

  /* ---------- Sổ tờ trình ---------- */
  function drawSo() {
    const q = norm($('#ttFind').value);
    const cnt = f => T.list.filter(r => f === 'all' || r.tt === f).length;
    $('#ttSoF').innerHTML = ['all'].concat(T.trangThai).map(f => `<button class="pill${f === soF ? ' on' : ''}" type="button" data-f="${esc(f)}">${f === 'all' ? 'Tất cả' : esc(f)} · ${cnt(f)}</button>`).join('');
    let list = T.list.filter(r => soF === 'all' || r.tt === soF);
    if (q) list = list.filter(r => norm([r.id, r.so, soHieu(r), r.vv, r.ma, T.loai[r.loai]].join(' ')).includes(q));
    const con = id => T.list.filter(x => x.goc === id && x.tt !== 'Hủy');
    $('#ttSoBody').innerHTML = list.length ? list.map(r => {
      const xk = con(r.id);
      const dvs = T.list.filter(x => x.goc === r.id && x.loai === 'dhdv' && x.tt !== 'Hủy');
      return `<tr data-id="${esc(r.id)}" style="cursor:pointer">
        <td><b class="mono">${esc(soHieu(r) || (r.loai === 'xuatkho' ? 'Xuất kho' : LOAI[r.loai] && LOAI[r.loai].dv ? 'Phiếu P.DV' : '—'))}</b><span class="sub2">${esc(r.ngay || 'chưa có ngày')}</span></td>
        <td>${esc(T.loai[r.loai] || r.loai)}${r.goc ? `<span class="sub2">Căn cứ ${esc(soHieu(T.list.find(x => x.id === r.goc) || {}) || r.goc)}</span>` : ''}</td>
        <td style="max-width:360px">${esc(String(r.vv).replace(/^Về việc\s*/i, ''))}</td>
        <td>${r.loai === 'xuatkho' ? '—' : LOAI[r.loai] && LOAI[r.loai].dv ? 'P.Dịch vụ' : esc(capTen(capOf(r.cap)))}</td>
        <td class="mono" style="text-align:right">${r.tong ? fm(r.tong) : '—'}</td>
        <td><span class="chip ${TT_CHIP[r.tt] || 'mute'}">${esc(r.tt)}</span>${xk.some(x => x.loai === 'xuatkho') ? `<span class="sub2">Đã có giấy xuất kho</span>` : ''}${dvs.length ? `<span class="sub2">Đã có phiếu đặt hàng P.DV</span>` : ''}</td>
        <td class="small">${r.word ? 'Word' : ''}${r.word && r.ky ? ' · ' : ''}${r.ky ? 'Bản ký' : ''}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="7"><div class="empty">Chưa có tờ trình.</div></td></tr>';
  }
  $('#ttSoF').onclick = e => { const p = e.target.closest('.pill'); if (p) { soF = p.dataset.f; drawSo(); } };
  $('#ttFind').oninput = () => drawSo();
  $('#ttSoBody').onclick = e => { const tr = e.target.closest('tr[data-id]'); if (tr) openRow(tr.dataset.id); };

  /* Hộp chi tiết 1 dòng sổ: ghi số/ngày, trạng thái, đính kèm bản ký, mở lại, nhân bản, tạo giấy xuất kho */
  let ROW = null;
  function openRow(id) {
    ROW = T.list.find(r => r.id === id); if (!ROW) return;
    const xkOk = LOAI[ROW.loai] && LOAI[ROW.loai].xkOk && ['Đã duyệt', 'Đã trình', 'Nháp'].includes(ROW.tt) && !T.list.some(x => x.goc === id && x.loai === 'xuatkho' && x.tt !== 'Hủy');
    $('#ttDlgDv').hidden = !(ROW.loai === 'dathang' && ROW.tt !== 'Hủy');
    $('#ttDlgT').textContent = T.loai[ROW.loai] || ROW.loai;
    $('#ttDlgV').textContent = ROW.vv;
    $('#ttDlgSo').value = ROW.so; $('#ttDlgSoHieu').textContent = khongSo(ROW.loai) ? '' : '/' + capOf(ROW.cap).so;
    $('#ttDlgSoBox').hidden = khongSo(ROW.loai);
    $('#ttDlgNgay').value = iso(ROW.ngay);
    $('#ttDlgTt').innerHTML = T.trangThai.filter(s => s !== 'Đã xuất kho' || (LOAI[ROW.loai] || {}).xkOk).map(s => `<button class="pill${s === ROW.tt ? ' on' : ''}" type="button" data-v="${esc(s)}">${esc(s)}</button>`).join('');
    $('#ttDlgFiles').innerHTML = [ROW.word ? `<a href="${docUrl(ROW.word)}" target="_blank" rel="noopener">Mở Google Docs ↗</a>` : '', ROW.word ? `<a href="${docxUrl(ROW.word)}" target="_blank" rel="noopener">Tải Word (.docx)</a>` : '',
      ROW.ky ? `<a href="${fileUrl(ROW.ky)}" target="_blank" rel="noopener">Bản đã ký ↗</a>` : ''].filter(Boolean).join(' · ') || '<span class="muted">Chưa có file Word, chưa có bản ký.</span>';
    $('#ttDlgFile').value = '';
    $('#ttDlgXk').hidden = !xkOk;
    $('#ttDlgId').textContent = ROW.id + ' · tạo ' + ROW.tao;
    openDlg('ttDlg');
  }
  $('#ttDlgTt').onclick = e => { const p = e.target.closest('.pill'); if (p) $$('#ttDlgTt .pill').forEach(x => x.classList.toggle('on', x === p)); };
  $('#ttDlgSave').onclick = () => busy($('#ttDlgSave'), 'Đang lưu', async () => {
    try {
      const on = $('#ttDlgTt .pill.on');
      const r = await call('ttStatus', PIN, ROW.id, { so: $('#ttDlgSo').value.trim(), ngay: vn($('#ttDlgNgay').value), tt: on ? on.dataset.v : ROW.tt });
      T.list = r.list;
      const f = $('#ttDlgFile').files[0];
      if (f) {
        const pdf = /pdf/i.test(f.type);
        const a = await call('ttAttach', PIN, ROW.id, pdf ? await fileToBase64(f) : await shrinkImage(f, 2200, 0.85), pdf ? 'application/pdf' : 'image/jpeg');
        T.list = a.list;
      }
      if (CUR && CUR.id === ROW.id) { const x = T.list.find(y => y.id === ROW.id); Object.assign(CUR, { so: x.so, ngay: iso(x.ngay), tt: x.tt, ky: x.ky }); }
      closeDlg('ttDlg'); toast('Đã cập nhật' + (f ? ' · đã đính kèm bản ký' : '')); drawAll();
    } catch (e) { toast(e, 1); }
  });
  async function openEdit(id, copy) {
    const g = await call('ttGet', PIN, id);
    CUR = { id: copy ? null : g.id, loai: g.loai, cap: g.cap || '', so: copy ? '' : g.so, ngay: copy ? '' : iso(g.ngay), vv: g.vv || '', cc: g.cc || '', md: g.md || '', dk: g.dk || '', kt: g.kt || '',
      goc: g.goc || '', tt: copy ? 'Nháp' : g.tt, word: copy ? '' : g.word, ky: copy ? '' : g.ky, data: (g.data && g.data.length ? g.data : [{ sec: '', rows: [{}] }]) };
    CUR.data.forEach(s => { if (!s.rows.length) s.rows.push({}); });
    closeDlg('ttDlg'); SUB = 'soan'; drawAll();
    toast(copy ? 'Đã nhân bản · chỉnh rồi bấm Lưu' : 'Đã mở ' + g.id);
  }
  $('#ttDlgEdit').onclick = () => busy($('#ttDlgEdit'), '', async () => { try { await openEdit(ROW.id, false); } catch (e) { toast(e, 1); } });
  $('#ttDlgCopy').onclick = () => busy($('#ttDlgCopy'), '', async () => { try { await openEdit(ROW.id, true); } catch (e) { toast(e, 1); } });
  $('#ttDlgDv').onclick = () => busy($('#ttDlgDv'), '', async () => {
    try { const id = ROW.id; blank('dhdv'); closeDlg('ttDlg'); SUB = 'soan'; await loadGoc(id); drawAll(); toast('Đã chép phụ kiện từ tờ trình · kiểm tra rồi bấm Lưu'); } catch (e) { toast(e, 1); }
  });

  /* ---------- Phiếu lắp đặt PK khuyến mãi: tìm xe khách trong sheet XE ---------- */
  let xeT = 0, XE = [];
  $('#ttXeQ').addEventListener('input', () => {
    clearTimeout(xeT);
    const q = $('#ttXeQ').value.trim();
    if (q.length < 3) { $('#ttXeKq').innerHTML = ''; return; }
    xeT = setTimeout(async () => {
      try {
        XE = await call('ttTimXe', PIN, q);
        if ($('#ttXeQ').value.trim() !== q) return;
        $('#ttXeKq').innerHTML = XE.length ? XE.map((x, i) => `<button class="tt-xe" type="button" data-i="${i}"><b>${esc(x.ten || '—')}</b><span class="small muted">${esc(x.lx)} · <span class="mono">${esc(x.sk)}</span>${x.sale ? ' · ' + esc(x.sale.split(' · ')[0]) : ''}</span></button>`).join('')
          : '<span class="small muted">Không tìm thấy xe. Gõ tay vào bảng.</span>';
      } catch (e) { toast(e, 1); }
    }, 300);
  });
  $('#ttXeKq').addEventListener('click', e => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    const x = XE[+b.dataset.i], rows = CUR.data[0].rows;
    if (rows.some(r => r.sk && r.sk === x.sk)) return toast('Xe này đã có trong bảng.', 1);
    const row = { ten: x.ten, lx: x.lx, sk: x.sk, sdt: x.sdt, sale: x.sale };
    const last = rows[rows.length - 1];
    if (last && !Object.keys(last).some(k => last[k])) rows[rows.length - 1] = row; else rows.push(row);
    $('#ttXeQ').value = ''; $('#ttXeKq').innerHTML = ''; drawTable();
    toast('Đã thêm ' + (x.ten || x.sk));
  });

  /* ---------- Nạp danh mục phụ kiện từ Excel (sheet DMSP PK) ---------- */
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve();
    return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = ok; s.onerror = () => no('Không tải được bộ đọc Excel. Vui lòng thử lại.'); document.head.appendChild(s); });
  }
  /** Tìm sheet có cột Mã SP + Tên sản phẩm + Giá bán buôn (ưu tiên sheet tên "DMSP PK") → [{ma, ten, gia, vt, model}] */
  function docDm(wb) {
    const nk = s => String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
    const names = wb.SheetNames.slice().sort((a, b) => (nk(b) === 'dmsp pk') - (nk(a) === 'dmsp pk'));
    for (const n of names) {
      const a = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' });
      for (let i = 0; i < Math.min(a.length, 10); i++) {
        const h = a[i].map(nk), c = k => h.findIndex(x => x.indexOf(k) === 0);
        const iMa = c('mã sp'), iTen = c('tên sản phẩm'), iGia = c('giá bán buôn');
        if (iMa < 0 || iTen < 0 || iGia < 0) continue;
        const iVt = c('vị trí kho'), iMd = c('model');
        return { sheet: n, rows: a.slice(i + 1).map(r => ({ ma: String(r[iMa]).trim(), ten: String(r[iTen]).trim(), gia: Math.round(Number(r[iGia]) || 0),
          vt: iVt >= 0 ? String(r[iVt]).trim() : '', model: iMd >= 0 ? String(r[iMd]).trim() : '' })).filter(r => /^[A-Za-z0-9-]{5,}$/.test(r.ma) && r.ten) };
      }
    }
    return null;
  }
  $('#ttDmFile').onchange = e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    busy($('#ttDmBtn'), 'Đang nạp', async () => {
      try {
        await loadXlsx();
        const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
        const d = docDm(wb);
        if (!d || !d.rows.length) return toast('Không thấy sheet có cột Mã SP, Tên sản phẩm, Giá bán buôn.', 1);
        if (!confirm(`Nạp ${d.rows.length} phụ kiện từ sheet "${d.sheet}" vào danh mục?\nMã đã có: cập nhật tên, giá. Mã mới: thêm vào.`)) return;
        const r = await call('ttDmImport', PIN, d.rows);
        T.dm = r.dm; fillStatic(); drawForm();
        toast(`Đã nạp danh mục: thêm ${r.them}, cập nhật ${r.sua} phụ kiện`);
      } catch (err) { toast(err, 1); }
    });
  };
  $('#ttDmBtn').onclick = () => $('#ttDmFile').click();

  $('#ttDlgXk').onclick = () => busy($('#ttDlgXk'), '', async () => {
    try { const id = ROW.id; blank('xuatkho'); closeDlg('ttDlg'); SUB = 'soan'; await loadGoc(id); drawAll(); toast('Đã chép danh mục từ tờ trình · kiểm tra rồi bấm Lưu'); } catch (e) { toast(e, 1); }
  });
})();
