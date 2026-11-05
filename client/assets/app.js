/* ============================================================
   E登录 · Windows 客户端原型（共用脚本）
   页面文件只写 <body data-page="…">，其余全在这里
   ============================================================ */
/* —— 页面预设：由 <body data-*> 驱动 —— */
const PRESET = (() => {
  const B = document.body.dataset || {};
  return {
    page:     B.page || 'daily',
    panel:    B.panel === '1',
    sub:      B.sub || null,
    method:   B.method || 'pwd',
    bound:    B.bound || 'yes',
    users:    +(B.users || 1),
    pwdState: B.pwstate || 'initpw',   // 默认「初始密码」：内置用户密码 123456，登录后强制改密（v2.2）
    lang:     B.lang || 'zh',
    skin:     B.skin === '1',
    esc:      B.esc === '1',
    faceErr:  B.faceerr === '1',
    desk:     B.desk === '1',
    err:      B.err || '',
    acc:      B.acc || '',
    pw:       B.pw || '',
    secm:     B.secm || '',
    /* v1.7：与后台策略联动的预置值（单页预览用） */
    offPwd:   B.offpwd || 'yes',        // yes | no       该用户是否可用离线账密
    osFill:   B.os || 'ok',             // ok | unify | rebind   OS 代填结果
    upper:    B.upper === '1',          // 账号名大写展示
    auto:     B.auto !== '0',           // 后台是否允许账密自动创建同名 OS 账号
    order:    B.order || 'def',         // 后台下发的认证方式启用与排序
    wall:     B.wall !== undefined ? +B.wall : -1,
    domain:   B.domain === '1',         // v2.0：设备是否加域（加域 = 身份读域账号）
    demoOpen: B.demoopen === '1',
    demo:     B.demo !== '0'
  };
})();

/* —— 外壳（所有页面共用同一份结构） —— */
const SHELL = `
<div id="wrap">
<div id="stage">
  <div class="bg"></div>

  <!-- 顶部安全提示条 -->
  <div class="topbar" id="topbar">
    <div class="pill"><i class="ic ic-warn"></i><span>护网期间 慎点慎传、操作留痕、违规追责</span></div>
  </div>

  <!-- 右上角换肤 -->
  <div class="skin" id="skin" title="换肤"><i class="ic ic-huanfu"></i></div>

  <!-- 时间 -->
  <div class="clock">
    <div class="t" id="clkT">9:26</div>
    <div class="d" id="clkD">2026/10/29 星期四</div>
  </div>

  <!-- LOGO / 标题 -->
  <div class="hero">
    <div class="logo"><img src="../../_assets/logo.png" alt="E登录"></div>
    <div class="who" id="who">沈慕青</div>
    <div class="sub" id="sub"></div>
  </div>

  <!-- 离线：右下角「未连接网络」卡片（设计稿 5.2.3，只提示不给按钮） -->
  <div class="nettip" id="bubble" hidden>
    <i class="ic ic-wifi"></i>
    <div><div class="t" id="bubT"></div><div class="s" id="bubS"></div></div>
  </div>

  <!-- 认证输入区 -->
  <div class="panel" id="panel"></div>

  <!-- 登录选项 -->
  <div class="optbar" id="optbar">
    <div class="sep"><span class="l"></span><span class="t">登录选项</span><span class="l"></span></div>
    <div class="row" id="optrow"></div>
  </div>

  <!-- 左下：已绑定用户 -->
  <div class="users" id="users"></div>

  <!-- 右下：功能栏 -->
  <div class="sysbar" id="sysbar"></div>

  <!-- 账号设置：贴齿轮弹出的浮层面板（不跳页） -->
  <div class="accp" id="accp" hidden></div>
  <!-- 换肤面板（右上角） -->
  <div class="skinp" id="skinp" hidden></div>
  <!-- 逃生授权返回（右下角） -->
  <div class="escp" id="escp" hidden></div>
  <!-- 滑块拼图校验 -->
  <div class="cap" id="cap" hidden></div>

  <!-- 浮层 -->
  <div class="pop" id="pop" hidden></div>
  <div class="ov" id="ov" hidden></div>
  <div class="modal" id="modal" hidden></div>
  <div class="toast" id="toast" hidden></div>

  <!-- 演示控制 -->
  <div class="demo" id="demo">
    <div class="hd"><span>演示控制</span><button id="demoToggle">收起</button></div>
    <div class="body">
      <div class="dr"><span>设备</span>
        <select id="dDomain">
          <option value="0">不加域</option>
          <option value="1">加域（chery）</option>
        </select>
      </div>
      <div class="dr"><span>已绑用户</span>
        <select id="dUsers">
          <option value="0">0 · 未绑定</option>
          <option value="1">1 · 单用户</option>
          <option value="2">2 · 公共设备</option>
          <option value="3">3 · 公共设备（满）</option>
        </select>
      </div>
      <div class="dr"><span>页面</span>
        <select id="dPage">
          <option value="first">首次登录</option>
          <option value="daily">日常登录</option>
          <option value="offline">离线登录</option>
        </select>
      </div>
      <div class="dr"><span>密码</span>
        <select id="dPwd">
          <option value="initpw">初始密码</option>
          <option value="ok">正常</option>
          <option value="expiring">即将过期</option>
          <option value="expired">已过期</option>
        </select>
      </div>
      <div class="dr"><span>策略</span>
        <select id="dSec">
          <option value="off">不需二次验证</option>
          <option value="on">需二次验证</option>
        </select>
      </div>
      <div class="dr"><span>二因素</span>
        <select id="dSecM">
          <option value="sms">短信</option>
          <option value="otp">动态口令</option>
          <option value="face">人脸</option>
          <option value="finger">指纹</option>
          <option value="qr">扫码</option>
          <option value="pwd">账号密码</option>
        </select>
      </div>
      <div class="dr"><span>代填</span>
        <select id="dOs">
          <option value="ok">正常</option>
          <option value="unify">失败 · 统一改密开</option>
          <option value="rebind">失败 · 统一改密关</option>
        </select>
      </div>
      <div class="dr"><span>自动</span>
        <select id="dAuto">
          <option value="1">允许</option>
          <option value="0">不允许</option>
        </select>
      </div>
      <div class="dr"><span>排序</span>
        <select id="dOrder">
          <option value="def">后台默认</option>
          <option value="face1">人脸优先</option>
          <option value="mini">仅账密+短信</option>
        </select>
      </div>
      <div class="dr"><span>背景</span>
        <select id="dWall">
          <option value="-1">后台默认</option>
          <option value="0">墙纸 1</option>
          <option value="3">墙纸 4</option>
          <option value="12">自选 1</option>
        </select>
      </div>
      <div class="dr"><span>离线</span>
        <select id="dOffPwd">
          <option value="yes">可用</option>
          <option value="no">从未用过账密</option>
        </select>
      </div>
      <div class="dr"><span>绑定上限</span>
        <select id="dMax">
          <option value="2">2 个</option>
          <option value="3">3 个</option>
          <option value="5">5 个</option>
        </select>
      </div>
    </div>
  </div>

  <!-- 桌面 -->
  <div class="desktop" id="desktop">
    <div class="wall"></div>
    <div class="back" id="backLogin">← 返回登录<span class="tag">演示用</span></div>
    <div class="center">
      <div class="ok"><i class="ic ic-ok"></i></div>
      <div class="t1">登录成功</div>
      <div class="t2" id="deskTip">已进入操作系统桌面</div>
    </div>
  </div>

  <!-- 原生操作系统登录页（逃生后） -->
  <div class="native" id="native">
    <div class="box">
      <i class="ic ic-winos"></i>
      <div class="t">Windows 原生登录</div>
      <div class="s">已退出 E登录，此路径不走统一身份认证，没有单点能力</div>
      <div class="back" id="nativeBack">← 返回 E登录（演示用）</div>
    </div>
  </div>
</div>
</div>
`;
document.body.insertAdjacentHTML('afterbegin', SHELL);

/* ============================================================
   数据
   ============================================================ */
const $ = id => document.getElementById(id);
const L = (zh, en) => S.lang === 'en' ? en : zh;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* 账号名一律按统一身份系统的原始值展示（v2.0 去掉「大小写切换」演示开关） */

/* 首次登录 · 短信：由统一身份账号去找绑定的手机号（演示：按账号哈希造一个固定的 11 位号码） */
function phoneOf(acc){
  const s = String(acc || '').trim();
  if (!s) return '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) & 0x7fffffff;
  return '18' + (h % 10) + String((h >> 3) % 100000000).padStart(8, '0');
}

/* 本机已绑定的用户里找同一个统一身份账号 —— 一个用户在一台设备上只能绑一次 */
function findBound(key){
  const k = String(key || '').trim().toLowerCase();
  if (!k) return null;
  return USERS.slice(0, S.userCount)
    .find(u => String(u.acc || '').toLowerCase() === k || String(u.nm || '').toLowerCase() === k);
}

/* pw = 该用户的统一身份密码。内置用户默认初始密码 123456；
   首次登录时用户自己输入的密码会写进这条记录，之后日常登录按它校验（v2.2） */
const USERS = [
  { nm:'沈慕青', acc:'shenmuqing', id:'s00000122', av:'沈', win:'shenmuqing', pw:'123456', methods:['pwd','qr','sms','face','otp','finger'] },
  { nm:'李静',   acc:'lijing',     id:'s00000235', av:'李', win:'lijing',     pw:'123456', methods:['pwd','sms','face'] },
  { nm:'王海涛', acc:'wanghaitao', id:'s00000341', av:'王', win:'wanghaitao', pw:'123456', methods:['pwd','qr','otp'] }
];
const INIT_PW = '123456';   // 初始密码（未改密前内置用户都可用它登录）
const MAX_USERS = 3;   // 终端允许绑定用户数（后台配置；演示里由控制区的「绑定上限」改）

/* 统一身份目录（演示用）：账号 → 姓名。绑定时按账号查姓名，查不到才用账号本身兜底 */
const DIRECTORY = { shenmuqing:'沈慕青', lijing:'李静', wanghaitao:'王海涛', zhaoliu:'赵柳' };
const nmOf = a => DIRECTORY[String(a || '').trim().toLowerCase()] || String(a || '').trim();

/* ============================================================
   加域设备（v2.0，奇瑞 chery 域演示）
   域内设备：身份不是「输入」的，是「读」出来的 —— 客户端读本机域账号下拉框，
   取域账号后面的 s9000XXXX 作为统一身份账号；绑定后日常登录直接显示
   中文名 + 英文名 +（部门）+ 账号后四位（对齐沁给的真机截图）
   ============================================================ */
const DOMAIN = 'chery';                                   // 域短名
const DOMAIN_OS = ['s90004518', 's90000980', 's90003127', 's90006407'];  // 4 位随机数
const osFull = a => DOMAIN + '\\' + a;                    // s90004518 → chery\s90004518
/* 域目录：域账号 → 中文名 / 英文名 / 部门（演示数据，按沁要求自造） */
const DOMAIN_DIR = {
  s90004518: { zh:'王丰镐', en:'Fenggao Wang', dept:'全球数字化智能中心' },
  s90000980: { zh:'刘海涛', en:'Haitao Liu',   dept:'全球数字化智能中心' },
  s90003127: { zh:'陈思远', en:'Siyuan Chen',  dept:'智能驾驶研究院' },
  s90006407: { zh:'周雨桐', en:'Yutong Zhou',  dept:'全球数字化智能中心' }
};
/* 下拉里存完整账号（chery\s9000XXXX），取号时切掉域前缀 */
const osNum = a => String(a || '').split('\\').pop();
const dmOf  = a => DOMAIN_DIR[osNum(a)] || { zh: osNum(a), en:'', dept:'' };
/* 域用户对象：加域设备绑定出来的用户（账号 = 域账号，不是 s0000XXXX） */
function domainUser(osAcc){
  const full = String(osAcc || '').indexOf('\\') > -1 ? osAcc : osFull(osAcc || DOMAIN_OS[0]);
  const num = osNum(full);
  const d = DOMAIN_DIR[num] || { zh: num, en:'', dept:'' };
  return {
    nm: d.zh, en: d.en, dept: d.dept,
    acc: num, id: num, av: d.zh.slice(0, 1), win: full, pw: INIT_PW,
    methods: methodsOf(num)
  };
}
/* 操作系统账号下拉：加域 = 域账号；不加域 = 本机本地账号 */
const osList = () => S.domain ? DOMAIN_OS.map(osFull) : S.osAccs;

/* 每个绑定用户可用的认证方式不同（后台按用户下发绑定关系）。
   演示：按账号哈希取一组固定组合，保证切用户时图标条真的会变（v2.1 沁） */
const METHOD_SETS = [
  ['pwd','sms','face'],
  ['pwd','qr','otp'],
  ['pwd','sms','face','finger'],
  ['pwd','otp','finger'],
  ['pwd','qr','sms','face'],
  ['pwd','sms','otp','face','finger']
];
function methodsOf(acc){
  let h = 0; const t = String(acc || '');
  for (let i = 0; i < t.length; i++) h = (h * 131 + t.charCodeAt(i)) & 0x7fffffff;
  return METHOD_SETS[h % METHOD_SETS.length].slice();
}

const ID_PW = 'Abc@12345';   // 演示：统一身份用户密码（身份确认用）
const MASK_PHONE = '188****0008';   // 已绑定手机号（中间四位脱敏）

const METHODS = [
  { id:'pwd',    zh:'账号密码', en:'Password',    ic:'ic-zhangmi' },
  { id:'qr',     zh:'扫码',     en:'QR code',     ic:'ic-erweima' },
  { id:'sms',    zh:'短信',     en:'SMS',         ic:'ic-duanxin' },
  { id:'face',   zh:'人脸',     en:'Face',        ic:'ic-face' },
  { id:'otp',    zh:'动态口令', en:'One-time pwd',ic:'ic-otp' },
  { id:'finger', zh:'指纹',     en:'Fingerprint', ic:'ic-zhiwen' }
];

/* ============================================================
   状态
   ============================================================ */
let S = {
  page:'daily',      // daily | first | offline | register | escape
  panel:null,        // null | 'accp'   账号设置浮层面板
  skinOpen:false,    // 换肤面板
  wall:0,            // 当前壁纸序号（-1 = 后台默认，用页面自带背景）
  escPop:false,      // 逃生授权返回浮层
  cap:false,         // 滑块拼图是否打开
  capOk:false,       // 滑块是否通过
  contact:'phone',   // 身份验证方式：phone | mail | dd
  smsCode:'123456',  // 演示验证码
  faceErr:false,     // 人脸：摄像头打开失败
  method:'pwd',
  user:0,
  userCount:1,       // 1 | 3 | 0（0 = 未绑定用户，只能走首次登录）
  pwdState:'ok',     // ok | expiring | expired | wrong | initpw
  sec:'off',         // off | on   策略要求二次验证
  secDone:false,     // 本次登录的二次验证是否已通过
  secFirst:'pwd',    // 二次验证之前的「第一因素」方式（二次验证必须换一种方式）
  secMethod:'sms',   // 二次验证当前选用的方式
  bindDone:false,    // 本次登录的绑定关系是否已写入（防止重复建用户）
  newSeq:123,        // 新增用户的工号序号：s00000123、s00000124…
  pending:null,      // 二次验证通过后的去向：desk
  pwWhy:'',          // 改密失败时，具体未满足的规则
  bound:'yes',       // yes | no   本机是否已绑定
  anomaly:'none',    // none | bound3 | os3   （初始密码已移到「密码」下拉）
  sub:null,          // 页内子态
  step:0,            // 忘记密码 / 改密 步骤
  err:'', okMsg:'',
  form:{},
  eye:{},
  smsLeft:0,
  qrFail:false,
  boundDM:'灵儿',
  faceOn:true,
  lang:'zh',
  autoCreate:false,  // 首次登录/注册：自动创建操作系统账号（默认不勾，勾选后隐藏两个 Windows 字段）
  boundOS:'s00000122',
  osAccs:['Administrator','shenmuqing','zhangsan','wanghaitao'],
  osType:'user',       // 自动创建的操作系统账号类型（选项由后端管控）
  osTypes:[{v:'user',zh:'普通用户',en:'Standard user'},{v:'admin',zh:'管理员',en:'Administrator'}],
  osPwd:'P@ssw0rd',    // 创建时生成的操作系统账号密码
  net:'BC',
  nets:[{n:'BC',on:true,lock:true},{n:'freewifi',on:false,lock:false},{n:'TP-LINK_FDD0',on:false,lock:true}],
  days:3,
  mErr:'',
  /* —— v1.7：与后台策略联动的状态（客户端只读下发值） —— */
  offPwd:'yes',        // yes | no   该用户离线是否可用账密（no = 从注册起从未用过账密）
  osFill:'ok',         // ok | unify | rebind  OS 代填结果（由后台「统一改密」开关决定后两种）
  osDone:false,        // 本次登录是否已处理完代填失败（统一改密 / 重新关联）
  allowAuto:true,      // 后台是否允许账密自动创建同名操作系统账号
  order:'def',         // def | face1 | mini  后台下发的认证方式启用与排序
  rbAcc:'',            // 重新关联 OS 凭证：选中的账号
  rbPw:'',             // 重新关联 OS 凭证：密码
  /* —— v2.0：设备是否加域 —— */
  domain:false,        // true = 加域设备：身份读本机域账号，绑出来的是 s9000XXXX
  dmOs:'',             // 加域设备当前选中的操作系统域账号（chery\s9000XXXX）
  /* —— v2.2 —— */
  newPw:'',            // 首次登录中改过的新密码（绑定那一步写进用户记录）
  secPolicy:'sms',     // 演示控制指定的第二因素（默认短信）
  maxUsers:3           // 终端允许绑定用户数（演示可控）
};
let M = null;                 // 弹窗
let smsTimer = null;

/* 页面预设生效：每个页面文件通过 <body data-*> 指定初始状态 */
Object.assign(S, {
  page:      PRESET.page,
  method:    PRESET.method,
  bound:     PRESET.bound,
  userCount: PRESET.users,
  pwdState:  PRESET.pwdState,
  lang:      PRESET.lang,
  panel:     PRESET.panel ? 'accp' : null,
  skinOpen:  PRESET.skin,
  escPop:    PRESET.esc,
  faceErr:   PRESET.faceErr,
  err:       PRESET.err,
  /* v1.7 策略联动预置 */
  offPwd:    PRESET.offPwd,
  osFill:    PRESET.osFill,
  allowAuto: PRESET.auto,
  order:     PRESET.order,
  wall:      PRESET.wall,
  /* v2.0 设备是否加域 */
  domain:    PRESET.domain
});
if (!PRESET.auto) S.autoCreate = false;
/* 加域设备：本机已有的用户不是「输入出来的」，是域里读出来的；
   单页预览时直接把首位用户换成默认域账号（chery\s90004518 · 王丰镐） */
if (S.domain){
  S.dmOs = osFull(DOMAIN_OS[0]);
  S.form.acc = osNum(S.dmOs);          // 统一身份账号 = 读出来的域账号
  if (S.userCount >= 1) USERS[0] = domainUser(DOMAIN_OS[0]);
}
if (PRESET.sub) S.sub = PRESET.sub;
if (PRESET.users > 1) S.user = 0;
/* 单页里预置「已填写」的内容：用于预览确认页等需要承接上一步输入的场景 */
if (PRESET.acc) S.form.acc = PRESET.acc;
if (PRESET.pw)  S.form.pw  = PRESET.pw;
if (PRESET.secm) S.secMethod = PRESET.secm;

/* ============================================================
   通用组件
   ============================================================ */
function field(id, ic, ph, o = {}){
  const v = o.value !== undefined ? o.value : (S.form[id] ?? '');
  const isPwd = o.type === 'password';
  const show = isPwd && S.eye[id];
  return `<div class="field ${o.err?'err':''} ${o.short?'short':''} ${o.ro?'ro':''}">
    <span class="lead"><i class="ic ${ic}"></i></span>
    <input id="${id}" type="${show?'text':(o.type||'text')}" placeholder="${ph}"
           value="${esc(v)}" autocomplete="off" ${o.readonly?'readonly':''}>
    ${isPwd ? `<span class="eye" data-act="eye" data-id="${id}">
      <i class="ic ${show?'ic-eye-on':'ic-eye-off'}"></i></span>` : ''}
  </div>`;
}
const errline = () => `<div class="errline ${S.err?'':'hide'}">${
  S.err ? `<span class="dot"></span><span>${S.err}</span>` : '<span>&nbsp;</span>'}</div>`;
const btn = (label, act, cls = '', need = '') =>
  `<button class="btn ${cls}" data-act="${act}" ${need?`data-need="${need}"`:''}>${label}</button>`;
const hint = (html, style = '') => `<div class="hint" style="${style}">${html}</div>`;
const demoLine = html => `<div class="hint demoline">${html}</div>`;

/* 密码要求气泡（设计稿 3.6.8）：挂在密码框右侧，聚焦才出现 */
const PWTIP = `<div class="pwtip"><div class="h">${L('密码要求：','Password rules:')}</div><ol>
  <li>${L('长度为 8~20 个字符','8–20 characters')}</li>
  <li>${L('允许数字、大写字母、小写字母、特殊字符','Digits, upper/lower case, symbols')}</li>
  <li>${L('至少包含数字、大写字母、小写字母、特殊字符中的 3 种','At least 3 of the 4 types')}</li>
  <li>${L('不允许弱口令','No weak passwords')}</li></ol></div>`;
const pwWrap = (inner, bad) => `<div class="pwwrap ${bad ? 'bad' : ''}">${inner}${PWTIP}</div>`;
/* 改密失败的具体原因（气泡保留 + 一句说明，避免用户反复试） */
const pwWhyLine = () => S.pwWhy
  ? `<div class="pwwhy"><span class="dot"></span>${S.pwWhy}</div>` : '';

/* 一体式「验证码 + 获取验证码」（设计稿 3.6.1） */
function codeField(id, o = {}){
  const left = o.left || 0;
  const off = !!o.disabled;                 // 离线：取码按钮不可用
  return `<div class="field code">
    <span class="lead"><i class="ic ic-code"></i></span>
    <input id="${id}" placeholder="${o.ph || L('短信验证码','SMS code')}"
           value="${esc(S.form[id] ?? '')}" autocomplete="off" ${off?'disabled':''}>
    <button class="code-in" data-act="${o.act || 'sendSms'}" ${(left || off) ? 'disabled' : ''}>
      <span class="ring"><i class="ic ic-code"></i></span><span class="vline"></span>
      <span class="tx">${left ? left + ' s' : L('获取验证码','Send code')}</span>
    </button>
  </div>`;
}

/* ============================================================
   渲染 · 外壳
   ============================================================ */
function isLoginPage(){ return ['daily','first','offline','register'].includes(S.page); }

function render(){
  /* v2.3：本机没有绑定用户时只有一种可能 —— 首次登录。
     日常登录 / 离线登录都要求先有身份，任何入口（含动态改状态）都收口到首登页 */
  if (S.userCount === 0 && (S.page === 'daily' || S.page === 'offline')) S.page = 'first';
  /* 后台不允许账密自动创建时，本机也不许停留在已勾选状态（v1.7） */
  if (!S.allowAuto) S.autoCreate = false;
  /* v2.1：本机是否已绑定 = 有没有绑定用户，不再是独立状态，避免和用户数打架 */
  S.bound = S.userCount > 0 ? 'yes' : 'no';
  /* 二次验证页照设计稿保留「登录选项」图标条（示意本机可用方式），其余子态隐藏 */
  const secSub = ['forgot','forgotOk','pwdSec','firstPw','pwExpForm','rebind','osUnify'].includes(S.sub);
  // 页面级显隐（注册绑定页与首次登录同构，登录选项照常显示）
  $('optbar').style.display = isLoginPage() && !secSub ? 'block' : 'none';
  $('users').style.display  = ['daily','offline','register','first'].includes(S.page) && S.userCount > 0 ? 'flex' : 'none';
  $('accp').hidden = !S.panel;
  $('bubble').hidden = S.page !== 'offline';
  $('skinp').hidden = !S.skinOpen;
  $('escp').hidden = !S.escPop;
  $('cap').hidden = !S.cap;

  document.querySelector('.clock').style.display = 'block';
  renderHero();
  const optT = document.querySelector('.optbar .sep .t');
  if (optT) optT.textContent = L('登录选项','Sign-in options');
  renderOptions();
  renderUsers();
  renderSysbar();
  $('panel').innerHTML = panelHTML();
  $('panel').style.display = 'flex';

  if (S.panel) renderAccp();
  if (S.skinOpen) renderSkin();
  if (S.escPop) renderEsc();
  if (S.cap) renderCap();
  if (S.page === 'offline') renderBubble();
  if (['daily','first','offline','register'].includes(S.page)
      && (S.method === 'qr' || (S.sub === 'sec' && S.secMethod === 'qr'))) drawQR();
  syncSubmit();
  adjustOptions();
  syncDemo();
  renderModal();
}

function renderHero(){
  const u = USERS[S.user] || USERS[0];
  const linkSub = L('请将您的统一身份账号与操作系统账号关联',
                    'Link your unified identity and OS accounts');
  let who = '', sub = '';

  /* 首次登录与「新账号注册」共用同一套标题文案（沁 2026-10-29） */
  const firstTitle = () => {
    who = L('首次登录','First sign-in');
    /* 扫码的提示文案在二维码上方（methodHTML 内），副标题不再重复 */
    sub = (S.method === 'qr' || S.method === 'face' || S.method === 'finger') ? '' : linkSub;
    /* 加域设备：账号不是输入出来的，是从域里读出来的 —— 副标题说清楚这一点 */
    if (S.domain && (S.page === 'register' || S.method === 'pwd' || S.method === 'otp' || S.method === 'sms')){
      sub = L('已读取本机域账号，确认后输入密码完成绑定',
              'Domain account detected — confirm and sign in to bind');
    }
  };

  if (S.page === 'daily' || S.page === 'offline'){
    if (S.domain){
      /* v2.0 加域设备：身份来自域账号，中间显示「中文名 英文名」+「（部门）账号后四位」
         对齐沁给的真机截图（王丰镐 Fenggao Wang （全球数字化智能中心）…） */
      const d = dmOf(u.acc || u.win);
      const tail = String(u.acc || osNum(u.win) || '').slice(-4);
      who = [d.zh, d.en].filter(Boolean).join(' ');
      sub = d.dept ? `（${d.dept}）${tail}` : tail;
    } else {
      who = u.nm;
      sub = (S.sub === 'pwdSec' || S.sub === 'forgot')
        ? L('为了您的账号安全，请确认本人操作','Confirm it is you') : '';
      /* v1.9：两种收尾都用「用户名，您好」当标题，不再用「统一改密 / 重新关联 OS 凭证」当标题 */
      if (S.sub === 'rebind' || S.sub === 'osUnify'){
        who = L(`${u.nm}，您好`, `Hello, ${u.nm}`); sub = '';
      }
    }
  } else if (S.page === 'first'){
    if (S.sub === 'osPreview'){ who = ''; }
    else if (S.sub === 'sec'){ who = L('二次验证','Second step'); }
    else firstTitle();
  } else if (S.page === 'register'){
    /* 注册绑定的标题与副标题都按首次登录展示 */
    firstTitle();
  } else if (S.page === 'escape'){
    who = L('逃生登录','Escape sign-in');
    sub = L('需管理员授权，输入授权码后返回原生操作系统登录页',
            'Administrator authorisation required');
  }
  $('who').textContent = who;
  $('sub').textContent = sub;
  /* 加域设备：姓名块比普通单行标题更长，给一档专属字号（沁 2026-11-02） */
  const dm = S.domain && (S.page === 'daily' || S.page === 'offline');
  $('who').className = dm ? 'who dm' : 'who';
  $('sub').className = dm ? 'sub dm' : 'sub';
}

/* 后台下发的「认证方式启用 + 排序」（v1.7 策略联动）：
   客户端不写死顺序，未启用的方式不出现、也不占位 —— 图标条按这里给的顺序渲染 */
function backendOrder(){
  const all = METHODS.map(m => m.id);
  if (S.order === 'face1') return ['face', 'finger', 'pwd', 'qr', 'sms', 'otp'];
  if (S.order === 'mini')  return ['pwd', 'sms'];
  return all;
}

function renderOptions(){
  /* 未绑定用户没有个人绑定信息 → 展示策略启用的全部方式 */
  const avail = S.userCount === 0
    ? METHODS.map(m => m.id)
    : USERS[S.user].methods;
  const ord = backendOrder();
  /* 只渲染「策略启用 ∩ 该用户已绑定」的方式（沁 2026-10-29 / 2026-11-02） */
  const list = METHODS
    .filter(m => ord.includes(m.id) && avail.includes(m.id))
    .sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id));
  /* 当前方式被后台关掉时，落到第一个可用方式，避免认证区停在一个不存在的入口上 */
  if (list.length && !list.some(m => m.id === S.method)) S.method = list[0].id;
  $('optrow').innerHTML = list.map(m => {
    const on = S.method === m.id;
    return `<div class="ci ${on?'on':''}" data-m="${m.id}">
      <div class="tip">${L(m.zh, m.en)}</div>
      <i class="ic ${m.ic}"></i></div>`;
  }).join('');
}

/* 公共设备里用户名不可重复：同名的按出现顺序补 (2)(3)…，避免两个「沈慕青」分不清（v2.1） */
function dedupeNames(list){
  const seen = {};
  return list.map(u => {
    const base = String(u.nm || u.acc || '');
    seen[base] = (seen[base] || 0) + 1;
    return seen[base] === 1 ? base : base + '(' + seen[base] + ')';
  });
}

function renderUsers(){
  const list = USERS.slice(0, S.userCount);
  const one = list.length === 1;
  const names = dedupeNames(list);
  $('users').innerHTML = list.map((u,i) =>
    `<div class="u ${i===S.user?'on':''}" data-u="${i}">
       <span class="av"><i class="ic ic-user"></i></span>
       ${one ? `<span class="id">${esc(u.acc || u.id)}</span>`
              : `<span class="nm">${esc(names[i])}</span><span class="id mini">${esc(u.id)}</span>`}
     </div>`).join('');
}

function renderSysbar(){
  const items = [['shezhi','设置','ic-shezhi']];
  // 「新账号注册」仅设备已有绑定用户时出现；从未绑定 → 启动即首次登录页，不出现该图标
  if (S.bound === 'yes') items.push(['adduser','新账号注册','ic-bangding']);
  items.push(['wifi','网络','ic-wifi'], ['batt','电量','ic-dianchi'],
             ['escape','逃生返回','ic-taosheng'], ['power','关机 / 重启','ic-guanji']);
  $('sysbar').innerHTML = items.map(([k,t,ic]) =>
    `<div class="si" data-s="${k}" title="${t}"><i class="ic ${ic}"></i>${
      k === 'wifi' && S.page === 'offline' ? '<span class="dot"></span>' : ''}</div>`).join('');
}

function renderBubble(){
  const gen = S.anomaly === 'noService';
  $('bubT').textContent = gen
    ? L('认证服务不可用','Authentication service unavailable')
    : L('未连接网络','Not connected');
  /* 气泡里的离线建议按本机能力给：账密（仅当该用户有可用凭据）/ 动态口令 / 人脸 / 指纹；
     该用户从注册起从未用过账密时，气泡里不出现「账密」这条建议（v1.7） */
  const zhW = [S.offPwd !== 'no' ? '账密' : null, '动态口令', '人脸', '指纹'].filter(Boolean).join(' / ');
  const enW = [S.offPwd !== 'no' ? 'password' : null, 'OTP', 'face', 'fingerprint'].filter(Boolean).join(' / ');
  $('bubS').textContent = gen
    ? L(`检测到认证服务暂时不可用，可以连接网络，或改用离线${zhW}方式登录`,
        `Service unavailable — reconnect, or use offline ${enW}`)
    : L(`检测到当前设备未连接网络，可以连接网络，或改用离线${zhW}方式登录`,
        `Device is offline — reconnect, or use offline ${enW}`);
}

function adjustOptions(){
  const bar = $('optbar');
  if (bar.style.display === 'none') return;
  const p = $('panel');
  const pb = p.offsetTop + p.offsetHeight;
  bar.style.top = Math.max(689, pb + 26) + 'px';
}

/* ============================================================
   渲染 · 认证区
   ============================================================ */
function panelHTML(){
  switch (S.page){
    case 'first':    return firstHTML();
    case 'register': return registerHTML();
    case 'offline':  return offlineHTML();
    default:         return dailyHTML();
  }
}

function dailyHTML(){
  if (S.sub === 'rebind')       return rebindHTML();
  if (S.sub === 'osUnify')      return osUnifyHTML();
  if (S.sub === 'sec')          return secHTML();
  if (S.sub === 'firstPw')      return firstPwHTML();   // 初始密码 → 强制改密
  if (S.sub === 'pwExpNotice')  return expireNotice(true);
  if (S.sub === 'pwExpForm')    return expireHTML();
  if (S.sub === 'pwSoonNotice') return expireNotice(false);
  if (S.sub === 'pwdSec')       return pwdSecHTML();
  if (S.sub === 'forgot')       return forgotHTML();
  if (S.sub === 'forgotOk')     return forgotOkHTML();
  return methodHTML(S.method);
}

/* 离线登录（v1.7，按沁 2026-11-02 的认证逻辑变更）：
   可离线 = 账密（统一身份账号 + 统一身份密码）/ 动态口令 / 人脸 / 指纹 —— 本地校验，不依赖服务
   仅在线 = 扫码 / 短信 —— 给各自失败态（看得见、知道为什么用不了，不置灰隐藏）
   提示按方式分两条：仅在线「请检查您的网络设置」，可离线「将启用离线模式登录」 */
function offlineHTML(){
  const m = S.method;
  const tipOnline = `<div class="notice"><span class="dot"></span>${
    L('设备网络异常，请检查您的网络设置','Network error — check your connection')}</div>`;
  const tipOffline = `<div class="notice"><span class="dot"></span>${
    L('设备网络异常，将启用离线模式登录','Network error — offline sign-in enabled')}</div>`;

  /* —— 仅在线：扫码 —— */
  if (m === 'qr'){
    return `
      <div class="qrcap top">${L('打开微信/钉钉/飞书扫一扫登录','Scan with WeChat / DingTalk / Feishu')}</div>
      <div class="qrwrap"><canvas id="qrc" width="256" height="256"></canvas>
        <div class="qrmask"><i class="ic ic-refresh"></i>
          <div>${L('获取二维码失败','Failed to get the QR code')}</div>
          <u data-act="qrOfflineRefresh">${L('点击刷新','Refresh')}</u></div>
      </div>
      ${tipOnline}`;
  }

  /* —— 仅在线：短信（发不出验证码） —— */
  if (m === 'sms'){
    return `
      ${field('phone','ic-phone', L('手机号','Phone number'), {value: MASK_PHONE, readonly:true})}
      ${codeField('code', {disabled:true})}
      ${tipOnline}`;
  }

  /* —— 可离线：人脸（本地生物识别，不依赖服务） —— */
  if (m === 'face'){
    return `
      <div class="biobox"><i class="ic ic-user"></i></div>
      ${hint(L('请面向屏幕，保持面部在取景框内','Please face the screen'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="offFaceOk">${L('（演示）模拟识别通过','(demo) face passed')}</u>`)}
      ${tipOffline}`;
  }

  /* —— 可离线：指纹 —— */
  if (m === 'finger'){
    return `
      <div class="biobox"><i class="ic ic-zhiwen"></i></div>
      ${hint(L('请进行指纹校验','Please verify your fingerprint'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="offFingerOk">${L('（演示）模拟指纹通过','(demo) fingerprint passed')}</u>`)}
      ${tipOffline}`;
  }

  /* —— 可离线：动态口令 —— */
  if (m === 'otp'){
    return `${field('otp','ic-otp', L('请输入离线动态口令','Offline OTP'))}
      ${errline()}
      ${btn(L('立即登录','Sign in'), 'login', 'pri', 'otp')}
      ${tipOffline}`;
  }

  /* —— 账密 = 统一身份账号 + 统一身份密码（不再是 Windows 账密） ——
     特例：从注册起从未用过账密的用户，本机没有可校验的凭据 → 账密降级为仅在线。
     v1.9：这一态用行内文案说明，不再套人脸的方框，避免看起来像人脸认证 */
  if (S.offPwd === 'no'){
    return `
      <div class="sectip" style="color:#ffd08a">${L('该账号不支持离线账密','Offline password unavailable')}</div>
      <div class="secnote">${L('您尚未使用过账号密码登录，本机没有可校验的密码凭据；请改用离线动态口令 / 人脸 / 指纹',
        'No password credentials on this device — use offline OTP / face / fingerprint')}</div>
      ${tipOnline}`;
  }
  return `
    ${field('opw','ic-mima', L('请输入统一身份密码','Identity password'), {type:'password'})}
    ${errline()}
    ${btn(L('立即登录','Sign in'), 'login', 'pri', 'opw')}
    ${tipOffline}`;
}

function methodHTML(m){
  switch (m){
    /* 账密：设计稿 2.1.1 —— 单输入框，无登录按钮，框内右侧 enter */
    case 'pwd': {
      const has = !!String(S.form.pw || '').length;
      return `
      <div class="field ${S.err?'err':''}">
        <input id="pw" type="${S.eye['pw']?'text':'password'}"
               placeholder="${L('请输入登录密码','Password')}"
               value="${esc(S.form.pw ?? '')}" autocomplete="off">
        <span class="i2 clr" data-clr-for="pw" data-act="clear" data-id="pw" ${has?'':'hidden'}>×</span>
        <span class="i2" data-act="eye" data-id="pw" data-eye-for="pw" ${has?'':'hidden'}>
          <i class="ic ${S.eye['pw']?'ic-eye-on':'ic-eye-off'}"></i></span>
        <button class="go" data-act="login" data-need="pw" ${has?'':'disabled'}
                title="${L('进入','Enter')}">→</button>
      </div>
      ${errline()}
      ${S.err ? `<div class="hintRow center" style="margin:-8px 0 12px">
        <span class="lk" data-act="forgot">${L('忘记密码','Forgot password')}</span></div>` : ''}`;
    }

    /* 扫码：提示文案在二维码上方 */
    case 'qr': return `
      <div class="qrcap top">${L('打开微信/钉钉/飞书扫一扫登录','Scan with WeChat / DingTalk / Feishu')}</div>
      <div class="qrwrap"><canvas id="qrc" width="256" height="256"></canvas>
        ${S.qrFail ? `<div class="qrmask"><i class="ic ic-refresh"></i>
          <div>${L('打开二维码失败，点击刷新','Failed to load QR code')}</div>
          <u data-act="qrRefresh">${L('刷新','Refresh')}</u></div>` : ''}
      </div>
      ${demoLine(`<u data-act="qrScan">${L('（演示）模拟手机扫码','(demo) simulate scan')}</u> ·
                  <u data-act="qrFail">${L('模拟拉取失败','simulate failure')}</u>`)}`;

    /* 短信：手机号带出已绑定号码（中间四位脱敏），只需填验证码 */
    case 'sms': return `
      ${field('phone','ic-phone', L('手机号','Phone number'), {value: MASK_PHONE, readonly:true})}
      ${codeField('code', {left: S.smsLeft})}
      ${errline()}
      ${btn(L('登录','Sign in'), 'login', '', 'code')}`;

    /* 人脸：设计稿 2.5.1 / 2.5.2 —— 方框四角，无按钮，含摄像头失败态 */
    case 'face': return S.faceErr ? `
      <div class="biobox">
        <i class="ic ic-camfail"></i>
        <span class="badge"><i class="ic ic-warn"></i></span>
        <div class="fmsg"><div class="b">${L('摄像头打开失败','Camera unavailable')}</div>
          <div>${L('请确认设备正确连接','Check the camera connection')}</div></div>
      </div>
      ${demoLine(`<u data-act="faceRetry">${L('（演示）重新检测设备','(demo) retry camera')}</u>`)}`
      : `
      <div class="biobox"><i class="ic ic-user"></i></div>
      ${hint(L('请面向屏幕，保持面部在取景框内','Please face the screen'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="faceOk">${L('（演示）模拟识别通过','(demo) face passed')}</u> ·
                  <u data-act="faceFail">${L('模拟摄像头失败','simulate camera failure')}</u>`)}`;

    /* 动态口令：输入控件与账密一致，无「立即激活」 */
    case 'otp': {
      const has = !!String(S.form.otp || '').length;
      return `
      <div class="field ${S.err?'err':''}">
        <input id="otp" placeholder="${L('请输入动态口令','One-time password')}"
               value="${esc(S.form.otp ?? '')}" autocomplete="off">
        <span class="i2 clr" data-clr-for="otp" data-act="clear" data-id="otp" ${has?'':'hidden'}>×</span>
        <button class="go" data-act="login" data-need="otp" ${has?'':'disabled'}
                title="${L('进入','Enter')}">→</button>
      </div>
      ${errline()}`;
    }

    /* 指纹：设计稿 2.6.1 —— 方框 + 指纹图形，无按钮 */
    case 'finger': return `
      <div class="biobox"><i class="ic ic-zhiwen"></i></div>
      ${hint(L('请进行指纹校验','Please verify your fingerprint'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="fingerOk">${L('（演示）模拟指纹通过','(demo) fingerprint passed')}</u>`)}`;
  }
  return '';
}

/* —— 二次验证：认证链的第二环 ——
   双因素 = 先认证一次、再认证一次；第二次必须换一种方式（沁 2026-10-30）
   v2.1：用哪种方式由认证链决定，不给用户选（沁 2026-11-02）
   = 后台排序里「第一个 ≠ 第一因素、且该用户已绑定」的方式 */
function secHTML(){
  const first = S.secFirst || 'pwd';
  const avail = S.userCount > 0 ? USERS[S.user].methods : METHODS.map(o => o.id);
  /* 认证链 = 后台下发的第二因素顺序（短信是最常见的第二因素，排在最前，其余按「认证方式排序」）*/
  const ord = ['sms', ...backendOrder()].filter((v, i, a) => a.indexOf(v) === i);
  const chain = ord.filter(id => id !== first && avail.includes(id));
  /* v2.2：演示控制里指定了第二因素就按它展示（默认短信，沁 2026-11-02）；
     指定项本身不可用（等于第一因素 / 该用户没绑）时按认证链回落 */
  const asked = S.secPolicy && S.secPolicy !== first && avail.includes(S.secPolicy) ? S.secPolicy : null;
  const m = asked || chain[0] || (first === 'sms' ? 'pwd' : 'sms');
  S.secMethod = m;                       // 写回状态，二维码等下游按它渲染

  let body = '', need = '';
  if (m === 'sms'){
    body = `${field('sphone','ic-phone', L('手机号','Phone number'), {value: MASK_PHONE, readonly:true})}
      ${codeField('scode', {act:'sendSms2', left: S.smsLeft})}`;
    need = 'scode';
  } else if (m === 'otp'){
    body = field('sotp','ic-otp', L('请输入动态口令','One-time password'));
    need = 'sotp';
  } else if (m === 'pwd'){
    body = field('spw','ic-mima', L('请输入登录密码','Password'), {type:'password'});
    need = 'spw';
  } else if (m === 'qr'){
    body = `<div class="qrcap top">${L('打开微信/钉钉/飞书扫一扫登录','Scan with WeChat / DingTalk / Feishu')}</div>
      <div class="qrwrap"><canvas id="qrc" width="256" height="256"></canvas></div>
      ${demoLine(`<u data-act="secOk">${L('（演示）模拟手机扫码通过','(demo) simulate scan')}</u>`)}`;
  } else if (m === 'face'){
    body = `<div class="biobox"><i class="ic ic-user"></i></div>
      ${hint(L('请面向屏幕，保持面部在取景框内','Please face the screen'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="secOk">${L('（演示）模拟识别通过','(demo) face passed')}</u>`)}`;
  } else {
    body = `<div class="biobox"><i class="ic ic-zhiwen"></i></div>
      ${hint(L('请进行指纹校验','Please verify your fingerprint'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="secOk">${L('（演示）模拟指纹通过','(demo) fingerprint passed')}</u>`)}`;
  }

  return `
    <div class="sectip">${L('为了保障您的账户安全，请完成二次验证',
        'Please complete secondary verification')}</div>
    ${body}
    ${errline()}
    ${btn(L('立即登录','Sign in'), 'secOk', '', need)}
    ${btn(L('返回上一级认证登录','Back to previous step'), 'secBack', 'ghost')}`;
}

/* —— 密码到期：先提示，再改密 —— */
function expireNotice(expired){
  return `
    <div style="width:360px;text-align:center;font-size:13px;line-height:1.7;
                color:${expired?'#ffb3ae':'#ffd08a'};margin-bottom:16px">
      ${expired
        ? L('您的密码过期，请修改登录密码','Your password has expired. Please change it')
        : L(`您的登录密码还有${S.days}天过期，请及时修改密码`,
            `Your password expires in ${S.days} days`)}
    </div>
    ${btn(L('立即修改','Change now'), 'expGo')}
    ${expired ? '' : btn(L('跳过，直接登录','Skip and sign in'), 'skipExpire', 'ghost')}`;
}

function expireHTML(){
  return `
    ${pwWrap(
      field('np1','ic-mima', L('请输入新密码','New password'), {type:'password'}) +
      field('np2','ic-mima', L('请再次输入新密码','Confirm new password'), {type:'password'}),
      S.pwWhy
    )}
    ${errline()}
    ${pwWhyLine()}
    ${btn(L('确定','OK'), 'doExpire')}
    ${btn(L('返回登录','Back'), 'expBack', 'ghost')}`;
}

/* —— 忘记密码：账号 → 手机号验证 → 新密码 → 重置成功 —— */
/* —— 身份认证 + 设置新密码（设计稿 3.6.1）——
   忘记密码与账号设置里的「密码安全」是同一套界面，只有入口和提交后动作不同 */
function credHTML(okAct){
  const c = S.contact;
  const opt = (v, t) => `<option value="${v}" ${c === v ? 'selected' : ''}>${t}</option>`;
  const val = c === 'phone' ? MASK_PHONE
            : c === 'mail'  ? 'she***@zhuyun.cn'
            : L('沈慕青（钉钉已绑定）', 'Shen Muqing (DingTalk bound)');
  const ic  = c === 'phone' ? 'ic-phone' : c === 'mail' ? 'ic-duanxin' : 'ic-bangding';
  return `
    <div class="field">
      <span class="lead"><i class="ic ic-user"></i></span>
      <select id="contact" class="fsel" data-act="contact">
        ${opt('phone', L('手机号','Phone'))}${opt('mail', L('邮箱','Email'))}${opt('dd', L('钉钉','DingTalk'))}
      </select>
    </div>
    <div class="field"><span class="lead"><i class="ic ${ic}"></i></span>
      <input id="contactVal" value="${esc(val)}" readonly></div>
    ${codeField('code', {left: S.smsLeft})}
    ${pwWrap(
      field('np1', 'ic-mima', L('请设置新的登录密码','New password'), {type:'password'}) +
      field('np2', 'ic-mima', L('请再次输入新的登录密码','Confirm password'), {type:'password'}),
      S.pwWhy
    )}
    ${errline()}
    ${pwWhyLine()}
    ${btn(L('确定','OK'), okAct, '', 'code,np1,np2')}
    ${btn(L('返回登录','Back to sign in'), 'pwdSecBack', 'ghost')}`;
}

function pwdSecHTML(){ return credHTML('pwdSecOk'); }

function forgotHTML(){ return credHTML('forgotDone'); }

function forgotOkHTML(){
  return `
    <div style="width:360px;text-align:center;font-size:14px;line-height:1.7;
                color:#9ee7b0;margin-bottom:6px">
      ${L('重置密码成功','Password reset')}
    </div>
    <div style="width:360px;text-align:center;font-size:12.5px;
                color:rgba(255,255,255,.72);margin-bottom:16px">
      ${L(`6 秒后自动进入操作系统（${S.cd ?? 6}）`, `Entering the OS in ${S.cd ?? 6}s`)}
    </div>
    ${btn(L('立即前往','Go now'), 'forgotGo')}`;
}

/* ============================================================
   渲染 · 首次登录
   ============================================================ */
function firstHTML(){
  if (S.sub === 'sec')      return secHTML();
  if (S.sub === 'osPreview') return osPreviewHTML();
  if (S.sub === 'bind')    return bindHTML();
  if (S.sub === 'firstPw') return firstPwHTML();
  return firstMethodHTML(S.method);
}

/* 自动创建操作系统账号 → 认证区变成预览确认（不再弹窗，设计稿「请务必记录以下信息」）
   数据一致性（沁 2026-10-30）：账号名称 = 上一步输入的统一身份用户名；
   账号密码 = 上一步输入的统一身份密码；账号类型可选，选项由后端管控下发 */
function osPreviewHTML(){
  const acc = String(S.form.acc || '').trim() || USERS[S.user].nm;
  const pwd = String(S.form.pw || '') || S.osPwd;
  return `
    <div class="osp">
      <div class="hi">${L(`${acc}，您好`, `Hello, ${acc}`)}</div>
      <div class="msg">${L('将为您自动创建操作系统账号，请务必记录以下信息',
        'An OS account will be created — please record the details below')}</div>
      <div class="kv">
        <div class="r"><span class="k">${L('账号类型：','Type:')}</span>
          <span class="v"><select id="osType" data-act="osType">
            ${S.osTypes.map(t => `<option value="${t.v}" ${
              S.osType === t.v ? 'selected' : ''}>${L(t.zh, t.en)}</option>`).join('')}
          </select></span></div>
        <div class="r"><span class="k">${L('账号名称：','Account:')}</span><span class="v">${esc(acc)}</span></div>
        <div class="r"><span class="k">${L('账号密码：','Password:')}</span><span class="v">${esc(pwd)}</span></div>
      </div>
      ${btn(L('确认','Confirm'), 'osConfirm', 'pri')}
    </div>`;
}

/* Windows 用户名 = 下拉选本机账号（v1.0 文档明确，不再手输）
   v2.0 加域设备：下拉里是本机所属域的域账号（chery\s9000XXXX），
   用户只在下拉里挑，不手输；统一身份账号由所选域账号带出 */
function osWinFields(){
  if (S.domain) return `
    <div class="field">
      <span class="lead"><i class="ic ic-winos"></i></span>
      <select id="osAcc" class="fsel" data-act="osAcc">
        ${osList().map(a => `<option value="${a}" ${
          (S.form.osAcc||osList()[0]) === a ? 'selected' : ''}>${a}</option>`).join('')}
      </select>
    </div>
    ${field('osPw','ic-mima', L('请输入操作系统密码','OS password'), {type:'password'})}`;
  if (S.autoCreate) return '';
  return `
    <div class="field">
      <span class="lead"><i class="ic ic-winos"></i></span>
      <select id="osAcc" class="fsel">
        ${S.osAccs.map(a => `<option value="${a}" ${(S.form.osAcc||S.osAccs[1])===a?'selected':''}>${a}</option>`).join('')}
      </select>
    </div>
    ${field('osPw','ic-mima', L('请输入 Windows 本地账户密码','Windows local password'), {type:'password'})}`;
}

/* 加域设备：统一身份账号只读，值来自上面选中的域账号 */
const dmAccField = () => field('acc', 'ic-user', '',
  { value: S.form.acc || osNum(S.dmOs), readonly: true, ro: true });

function firstMethodHTML(m){
  /* 不勾选「自动创建操作系统账号」时，复选框排在所有输入框之后；
     v1.7：后台未开启「账密自动创建同名 OS 账号」时，复选框不出现，必须选 / 填本机已有账号
     v2.0：加域设备的账号是域里现成的，「自动创建」这一套不适用 */
  const chk = (!S.allowAuto || S.domain) ? '' :
    `<div class="hintRow" style="justify-content:flex-start;margin:2px 0 12px">
      <span class="chk ${S.autoCreate?'on':''}" data-act="autoCreate">
        <i>${S.autoCreate?'✓':''}</i>${L('自动创建操作系统账号','Create the OS account automatically')}</span>
    </div>`;
  const needOS = 'acc,pw,osPw';

  switch (m){
    case 'pwd': {
      if (S.domain) return `
      ${dmAccField()}
      ${field('pw','ic-mima', L('请输入统一身份密码','Identity password'), {type:'password'})}
      ${osWinFields()}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '', 'pw,osPw')}`;
      return `
      ${field('acc','ic-user', L('请输入统一身份用户名','Identity username'))}
      ${field('pw','ic-mima', L('请输入统一身份密码','Identity password'), {type:'password'})}
      ${osWinFields()}
      ${chk}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '', S.autoCreate ? 'acc,pw' : needOS)}`;
    }

    case 'otp': {
      if (S.domain) return `
      ${dmAccField()}
      ${field('otp','ic-otp', L('动态口令，用户中心激活后使用','OTP, activate in the user centre first'))}
      ${osWinFields()}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '', 'otp,osPw')}`;
      return `
      ${field('acc','ic-user', L('请输入统一身份用户名','Identity username'))}
      ${field('otp','ic-otp', L('动态口令，用户中心激活后使用','OTP, activate in the user centre first'))}
      ${osWinFields()}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '',
        S.autoCreate ? 'acc,otp' : 'acc,otp,osPw')}`;
    }

    case 'sms': {
      /* 第一个框是统一身份账号，手机号由账号带出（只读，演示按账号造 11 位） */
      const ph = phoneOf(S.form.acc);
      if (S.domain) return `
      ${dmAccField()}
      ${field('phone','ic-phone', L('输入账号后自动带出绑定手机号','Bound phone number'),
              {value: ph, readonly: true})}
      ${codeField('code', {left: S.smsLeft, disabled: !ph})}
      ${osWinFields()}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '', 'code,osPw')}`;
      return `
      ${field('acc','ic-user', L('请输入统一身份账号','Identity account'))}
      ${field('phone','ic-phone', L('输入账号后自动带出绑定手机号','Bound phone number'),
              {value: ph, readonly: true})}
      ${codeField('code', {left: S.smsLeft, disabled: !ph})}
      ${osWinFields()}
      ${errline()}
      ${btn(L('登录','Sign in'), 'firstLogin', '',
        S.autoCreate ? 'acc,code' : 'acc,code,osPw')}`;
    }

    case 'qr': return `
      <div class="qrcap top">${L('打开微信/钉钉/飞书扫一扫登录','Scan with WeChat / DingTalk / Feishu')}</div>
      <div class="qrwrap"><canvas id="qrc" width="256" height="256"></canvas>
        ${S.qrFail ? `<div class="qrmask"><i class="ic ic-refresh"></i>
          <div>${L('打开二维码失败，点击刷新','Failed to load QR code')}</div>
          <u data-act="qrRefresh">${L('刷新','Refresh')}</u></div>` : ''}
      </div>
      <div class="hint okhint" style="margin:-6px 0 6px">${
        L('✓ 第三方扫码账号已绑定（微信 / 钉钉 / 飞书），扫码即可完成认证',
          '✓ Third-party account already bound — scan to verify')}</div>
      ${demoLine(`<u data-act="qrScanFirst">${L('（演示）认证通过','(demo) verify passed')}</u>`)}`;

    case 'face': return `
      <div class="biobox"><i class="ic ic-user"></i>
        <span class="badge ok"><i class="ic ic-ok"></i></span></div>
      <div class="hint okhint" style="margin-bottom:4px">${
        L('✓ 人脸信息已采集完成，请正对屏幕完成认证',
          '✓ Face captured — look at the screen to verify')}</div>
      ${demoLine(`<u data-act="faceFirst">${L('（演示）认证通过','(demo) verify passed')}</u>`)}`;

    case 'finger': return `
      <div class="biobox"><i class="ic ic-zhiwen"></i></div>
      ${hint(L('请进行指纹校验','Please verify your fingerprint'), 'margin-bottom:4px')}
      ${demoLine(`<u data-act="fingerFirst">${L('（演示）指纹通过','(demo) passed')}</u>`)}`;
  }
  return '';
}

/* 绑定页：第二类方式（扫码/人脸/指纹）认证通过后出现
   沁 2026-10-30：去掉钉钉绑定入口，默认第三方扫码与生物特征均已完成绑定 */
function bindHTML(){
  const u = USERS[S.user];
  const nm = String(S.form.acc || '').trim() || u.nm;
  return `
    <div style="width:360px;text-align:center;font-size:13px;line-height:1.7;
                color:rgba(255,255,255,.86);margin-bottom:4px">
      ${L(`${nm}，您好`, `Hello, ${nm}`)}</div>
    <div style="width:360px;text-align:center;font-size:12.5px;line-height:1.6;
                color:rgba(255,255,255,.66);margin-bottom:14px">
      ${L('登录成功仅差一步，请绑定您的操作系统账号','One step left — bind your OS account')}</div>
    <div class="field">
      <span class="lead"><i class="ic ic-winos"></i></span>
      <select id="bosAcc" class="fsel">
        ${osList().map(a => `<option value="${a}" ${(S.form.bosAcc||osList()[0])===a?'selected':''}>${a}</option>`).join('')}
      </select>
    </div>
    ${field('bosPw','ic-mima', L('请输入Windows的本地账户密码','Windows local password'), {type:'password'})}
    ${errline()}
    ${btn(L('登录','Sign in'), 'bindLogin')}`;
}

/* —— 代填失败 · B 路：自动拉起「重新关联 OS 凭证」——
   由后台「统一改密」开关关闭触发，样式与首次登录的绑定页一致（同一套表单与交互）；
   v1.9：标题就是「<姓名>，您好」，界面内不再重复问候，只留一句提示 */
function rebindHTML(){
  const acc = S.form.rbAcc || osList()[0];
  return `
    <div style="width:360px;text-align:center;font-size:12.5px;line-height:1.6;
                color:#ffd08a;margin-bottom:14px">
      ${L('操作系统密码已变更，请输入新的 OS 账号和密码以重新关联。',
          'Your OS password has changed. Enter the new OS account and password to re-link.')}</div>
    <div class="field">
      <span class="lead"><i class="ic ic-winos"></i></span>
      <select id="rbAcc" class="fsel" data-act="rbAcc">
        ${osList().map(a => `<option value="${a}" ${acc === a ? 'selected' : ''}>${a}</option>`).join('')}
      </select>
    </div>
    ${field('rbPw','ic-mima', L('请输入该 OS 账号的密码','OS account password'), {type:'password'})}
    ${errline()}
    ${btn(L('关联并继续登录','Re-link and continue'), 'rebindOk')}`;
}

/* —— 代填失败 · A 路：后台「统一改密」开关开启 ——
   操作系统密码统一改成与统一身份密码一致，改完继续登录（策略要求时再走二次验证）
   v1.9：标题同样是「<姓名>，您好」；文案明确告知「账密登录失败 → 已把 OS 密码改成统一身份密码」 */
function osUnifyHTML(){
  return `
    <div class="osp">
      <div class="msg" style="margin-bottom:14px">${
        L('操作系统账密登录失败，已将操作系统密码修改为统一身份密码，后续登录不再单独校验操作系统密码。',
          'OS sign-in failed — the OS password has been changed to your identity password.')}</div>
      <div class="kv">
        <div class="r"><span class="k">${L('账号：','Account:')}</span>
          <span class="v">${esc(USERS[S.user].win)}</span></div>
        <div class="r"><span class="k">${L('新密码：','Password:')}</span>
          <span class="v">${L('同统一身份密码','Same as identity password')}</span></div>
      </div>
      ${btn(L('继续登录','Continue'), 'osUnifyGo', 'pri')}
    </div>`;
}

function firstPwHTML(){
  return `
    <div style="width:360px;text-align:center;font-size:13px;line-height:1.6;
                color:#ffd08a;margin-bottom:12px">
      ${L('为了您的账号安全，请修改初始密码','For your security, please change the initial password')}</div>
    ${pwWrap(
      field('ip1','ic-mima', L('请输入新密码','New password'), {type:'password'}) +
      field('ip2','ic-mima', L('请再次输入新密码','Confirm password'), {type:'password'}),
      S.pwWhy
    )}
    ${errline()}
    ${pwWhyLine()}
    ${btn(L('确定','OK'), 'firstPwOk')}`;
}

/* ============================================================
   渲染 · 注册绑定 / 逃生登录
   ============================================================ */
function registerHTML(){
  /* 注册绑定：中心区域与首次登录完全一致（沁 2026-11-02：原来少了绑定页 / 强制改密两步，
     扫码、人脸、指纹认证通过后会停在二维码上），只在末尾多一行「返回登录」 */
  if (S.sub === 'sec')       return secHTML();
  if (S.sub === 'osPreview') return osPreviewHTML();
  if (S.sub === 'bind')      return bindHTML();
  if (S.sub === 'firstPw')   return firstPwHTML();
  return `${firstMethodHTML(S.method)}
    <div class="hintRow center" style="margin-top:12px">
      <span class="lk" data-act="goDaily">${L('已有账号？返回登录','Already have an account? Sign in')}</span></div>`;
}

/* 逃生授权返回：右下角浮层（设计稿「逃生授权返回」）
   沁 2026-10-30：错误提示不再复用账密失败的 S.err，演示态下任意授权码均放行 */
function renderEsc(){
  const v = S.form.esc || '';
  const show = S.eye['esc'];
  $('escp').innerHTML = `
    <div class="t">${L('授权码','Authorization code')}</div>
    <div class="field">
      <input id="esc" type="${show?'text':'password'}" placeholder="${L('请输入授权码','Authorization code')}"
             value="${esc(v)}" autocomplete="off">
      <span class="i2" data-act="eye" data-id="esc">
        <i class="ic ${show?'ic-eye-on':'ic-eye-off'}"></i></span>
    </div>
    <button class="btn" data-act="escUnlock" data-need="esc" ${v?'':'disabled'}>
      ${L('立即解锁','Unlock now')}</button>`;
}

/* ============================================================
   换肤面板（设计稿 2.7.5：背景墙纸 12 张 + 自选墙纸 16 张）
   ============================================================ */
const WALLS = [
  /* 背景墙纸 12 */
  'linear-gradient(135deg,#9cf0f5,#0e63c8)', 'linear-gradient(135deg,#ff8a8a,#c01054)',
  'linear-gradient(135deg,#e8fac2,#4fae3f)', 'linear-gradient(135deg,#dff3ff,#4aa3d8)',
  'linear-gradient(135deg,#ffd08a,#e2571f)', 'linear-gradient(135deg,#ff9ad5,#8a2be2)',
  'linear-gradient(135deg,#9fb7d8,#2b4470)', 'linear-gradient(135deg,#8fd3c7,#1d6f7a)',
  'linear-gradient(135deg,#ffd6e8,#b34f8f)', 'linear-gradient(135deg,#c8d8ff,#3b4fa8)',
  'linear-gradient(135deg,#2a3f6b,#0b1220)', 'linear-gradient(135deg,#f7c8a0,#a6491f)',
  /* 自选墙纸 16 */
  'linear-gradient(135deg,#b8c6ff,#5a6cf0)', 'linear-gradient(135deg,#a0e6ff,#2f8fe0)',
  'linear-gradient(135deg,#d6f7a8,#6aa832)', 'linear-gradient(135deg,#ffc2d1,#e8447c)',
  'linear-gradient(135deg,#a8d8ff,#3f6fb5)', 'linear-gradient(135deg,#6f8fbf,#1b2b4d)',
  'linear-gradient(135deg,#ffd9a0,#d97b18)', 'linear-gradient(135deg,#c2b5ff,#6b3fd0)',
  'linear-gradient(135deg,#7fe0d4,#1f7f8a)', 'linear-gradient(135deg,#ffb3a7,#c0442f)',
  'linear-gradient(135deg,#9fe8b8,#2f8f5f)', 'linear-gradient(135deg,#ff9ecb,#a8337f)',
  'linear-gradient(135deg,#cfd8e8,#5f7089)', 'linear-gradient(135deg,#8fc7ff,#1d4f9c)',
  'linear-gradient(135deg,#ffe9a8,#c99a13)', 'linear-gradient(135deg,#8b93a8,#2c3346)'
];

function renderSkin(){
  const cell = (i) => `<div class="wp ${S.wall===i?'on':''}" data-act="wall" data-i="${i}"
      style="background:${WALLS[i]}"></div>`;
  $('skinp').innerHTML = `
    <div class="st">${L('背景墙纸','SYSTEM WALLPAPERS')}</div>
    <div class="grid">${WALLS.slice(0,12).map((_,i)=>cell(i)).join('')}</div>
    <div class="st mt">${L('自选墙纸','MY WALLPAPERS')}</div>
    <div class="grid">${WALLS.slice(12).map((_,k)=>cell(k+12)).join('')}</div>`;
}

function applyWall(){
  const bg = document.querySelector('.bg');
  bg.style.background = S.wall >= 0 ? WALLS[S.wall] : '';
}

/* ============================================================
   滑块拼图（点「获取验证码」前的人机校验）
   ============================================================ */
function renderCap(){
  const done = S.capOk;
  $('cap').innerHTML = `
    <div class="ch"><span>${L('请完成安全验证','Security verification')}</span>
      <span class="x" data-act="capClose">×</span></div>
    <div class="ph">
      <div class="hole"></div>
      <div class="piece" id="capPiece"${done?' style="left:224px"':''}></div>
    </div>
    <div class="bar ${done?'ok':''}" id="capBar">
      <div class="fill" id="capFill"${done?' style="width:100%"':''}></div>
      <div class="knob" id="capKnob">${done?'✓':'→'}</div>
      <div class="tip">${done ? L('验证通过','Verified') : L('向右拖动滑块填充拼图','Drag the slider to the right')}</div>
    </div>`;
  if (!done) bindCap();
}

function bindCap(){
  const knob = $('capKnob'), bar = $('capBar'), piece = $('capPiece'), fill = $('capFill');
  if (!knob) return;
  const max = () => bar.clientWidth - knob.clientWidth - 2;
  const paint = (x) => {
    const r = Math.max(0, Math.min(1, x / max()));
    piece.style.left = (34 + r * 190).toFixed(1) + 'px';
    fill.style.width = (r * 100).toFixed(1) + '%';
    knob.style.transform = `translateX(${(r * max()).toFixed(1)}px)`;
  };
  const move = (e) => {
    const r = bar.getBoundingClientRect();
    paint(e.clientX - r.left - knob.clientWidth / 2);
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    if (knob.getBoundingClientRect().right >= bar.getBoundingClientRect().right - 6) capPass();
    else { knob.style.transform = 'translateX(0)'; paint(0); }
  };
  knob.onpointerdown = (e) => {
    e.preventDefault();
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
}

function capPass(){
  S.capOk = true; render();
  setTimeout(() => {
    S.cap = false; S.capOk = false;
    startSms();
    toast(L('验证码已发送：','Code sent: ') + S.smsCode);
    render();
  }, 450);
}

/* 提交可用性：所需输入都有值才允许点 */
function syncSubmit(){
  document.querySelectorAll('[data-need]').forEach(b => {
    const need = (b.dataset.need || '').split(',').filter(Boolean);
    const ok = need.every(id => {
      const el = $(id);
      return el && String(el.value || '').trim().length > 0;
    });
    b.disabled = !ok;
  });
}

/* ============================================================
   渲染 · 账号设置
   ============================================================ */
function renderAccp(){
  const u = USERS[S.user];
  const row = (ic, t, s, ctrl) => `<div class="srow">
      <span class="ri"><i class="ic ${ic}"></i></span>
      <span class="tx"><div class="tt">${t}</div><div class="ss">${s}</div></span>
      <span class="ct">${ctrl || ''}</span></div>`;

  const head = `<div class="hd">
      <div class="av">${u.av}</div>
      <div><div class="n">${u.nm}</div><div class="s">${esc(u.acc || u.id)} · ${L('统一身份用户','Identity user')}</div></div>
    </div>`;

  const body = `
    <div class="bd">
      <div class="grp">${L('设置','SETTINGS')}</div>
      <div class="rowlist">
        ${row('ic-mima', L('密码安全','Password security'), L('统一身份用户账号密码 · 已设置','Identity password · set'),
              `<button class="sbtn" data-act="chIdPw">${L('修改','Change')}</button>`)}
        ${row('ic-lang', L('语言切换','Language'), L('切换需要使用的语言','Change display language'),
              `<select class="sel" data-act="lang">
                 <option value="zh" ${S.lang==='zh'?'selected':''}>中文</option>
                 <option value="en" ${S.lang==='en'?'selected':''}>English</option></select>`)}
        ${row('ic-shezhi', L('产品信息','About'), L('竹云 Elogon 客户端 V1.8.4.2.021301','Bamboo Cloud Elogon V1.8.4.2.021301'), '')}
      </div>
      <div class="grp">${L('本机','THIS DEVICE')}</div>
      <div class="rowlist">
        ${row('ic-winos', L('Windows 账号','Windows account'), u.win,
              `<button class="sbtn" data-act="chWin">${L('更换','Change')}</button>`)}
        ${row('ic-user', L('注销账号','Deactivate account'),
              L('解除本机绑定并注销本人身份信息','Unbind this device'),
              `<button class="sbtn danger" data-act="delAcc">${L('注销','Deactivate')}</button>`)}
      </div>
    </div>`;

  $('accp').innerHTML = head + body +
    `<div class="ft"><span>${L('账号设置仅在登录前可用','Sign-in only')}</span></div>`;
}

/* ============================================================
   二维码（示意图形）
   ============================================================ */
function drawQR(){
  const c = $('qrc'); if (!c) return;
  const ctx = c.getContext('2d'), n = 25, px = c.width / n;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  let seed = 20261029;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  ctx.fillStyle = '#0b1a26';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++){
    const inFinder = (x < 7 && y < 7) || (x > n-8 && y < 7) || (x < 7 && y > n-8);
    if (inFinder) continue;
    if (rnd() > .52) ctx.fillRect(x*px, y*px, px*.92, px*.92);
  }
  const finder = (ox, oy) => {
    ctx.fillStyle = '#0b1a26'; ctx.fillRect(ox*px, oy*px, 7*px, 7*px);
    ctx.fillStyle = '#fff';    ctx.fillRect((ox+1)*px, (oy+1)*px, 5*px, 5*px);
    ctx.fillStyle = '#0b1a26'; ctx.fillRect((ox+2)*px, (oy+2)*px, 3*px, 3*px);
  };
  finder(0,0); finder(n-7,0); finder(0,n-7);
}

/* ============================================================
   弹窗
   ============================================================ */
function openModal(k, extra = {}){ M = { k, ...extra }; S.mErr = ''; S.mForm = {}; renderModal(); }
function closeModal(){ M = null; renderModal(); }

function renderModal(){
  const ov = $('ov'), md = $('modal');
  if (!M){ ov.hidden = true; md.hidden = true; md.innerHTML = ''; return; }
  ov.hidden = false; md.hidden = false;
  md.className = 'modal' + ((M.k === 'pwd' || M.k === 'win') ? ' wide' : '');
  md.innerHTML = modalHTML();
}

function mfield(id, ph, type = 'text'){
  const v = S.mForm[id] ?? '';
  return `<div class="field" style="width:100%;margin-bottom:10px">
    <input id="${id}" type="${type}" placeholder="${ph}" value="${esc(v)}" autocomplete="off"></div>`;
}
const merr = () => S.mErr ? `<div class="merr"><span class="dot"></span>${S.mErr}</div>` : '';

function modalHTML(){
  const k = M.k;
  if (k === 'created') return `
    <div class="mt">${L('将为您自动创建操作系统账号，请务必记录以下信息','An OS account will be created — please record it')}</div>
    <div class="mbody">
      <div class="kv">
        <div><span class="k">${L('账号类型','Type')}</span>Windows ${L('本地账号','local account')}</div>
        <div><span class="k">${L('账号名称','Account')}</span>shenmuqing</div>
        <div><span class="k">${L('账号密码','Password')}</span>Xk7#pQ2m</div>
      </div>
      <div class="ms" style="margin-top:12px">${L('用于服务离线时操作系统登录','Used for offline OS sign-in')}</div>
      <div class="mbtns"><button data-act="createdOk">${L('确认','OK')}</button></div>
    </div>`;

  if (k === 'pwd') return `
    <div class="mt">${L('修改统一身份用户账号密码','Change identity password')}</div>
    <div class="mbody">
      ${mfield('cp', L('请输入原密码','Current password'), 'password')}
      ${mfield('np', L('请输入新密码','New password'), 'password')}
      ${mfield('np2', L('请再次输入新密码','Confirm password'), 'password')}
      <div class="pwrule" style="width:100%">${L('密码长度 8~20 位；至少包含数字、小写字母、大写字母、特殊字符中的 3 类；不允许弱口令',
        'Length 8–20; at least 3 character types; no weak passwords')}</div>
      ${merr()}
      <div class="mbtns"><button class="ghost" data-act="mClose">${L('取消','Cancel')}</button>
        <button data-act="pwdOk">${L('确定','OK')}</button></div>
    </div>`;

  if (k === 'auth') return `
    <div class="mt">${L('身份确认','Confirm your identity')}</div>
    <div class="ms">${M.intent === 'win'
      ? L('更换 Windows 账号会改变本机登录方式，请先验证统一身份用户密码，验证通过后才能修改。',
          'Changing the Windows account affects how this device signs in. Verify your identity password to continue.')
      : L('注销会解除本机绑定并清除本人认证凭据，请先验证统一身份用户密码，验证通过后才能继续。',
          'Deactivation unbinds this device and removes your credentials. Verify your identity password to continue.')}</div>
    <div class="mbody">
      ${mfield('apw', L('统一身份用户密码','Identity password'), 'password')}
      ${demoLine(`<u data-act="authDemo">${L('（演示）填入密码 Abc@12345','(demo) fill password Abc@12345')}</u>`)}
      ${merr()}
      <div class="mbtns"><button class="ghost" data-act="mClose">${L('取消','Cancel')}</button>
        <button data-act="authOk">${L('验证','Verify')}</button></div>
    </div>`;

  if (k === 'win') return `
    <div class="mt">${L('更换 Windows 账号','Change Windows account')}</div>
    <div class="ms">${L('更换后，本机下次开机将使用新的 Windows 账号进入系统；原账号解除绑定。',
      'The device will use the new Windows account for sign-in; the previous one is unbound.')}</div>
    <div class="mbody">
      <div class="mlab">${L('当前账号','Current')} · ${USERS[S.user].win}</div>
      <div class="mlab">${L('选择新的 Windows 账号','Choose a new account')}</div>
      <select class="msel" id="wacc">
        ${S.osAccs.filter(a => a !== USERS[S.user].win)
            .map(a => `<option value="${a}">${a}</option>`).join('')}
      </select>
      ${mfield('wpw', L('该账号的 Windows 本地密码','Windows password for this account'), 'password')}
      ${merr()}
      <div class="mbtns"><button class="ghost" data-act="mClose">${L('取消','Cancel')}</button>
        <button data-act="winOk">${L('确认更换','Change')}</button></div>
    </div>`;

  if (k === 'del') return `
    <div class="mt">${L('注销账号','Deactivate account')}</div>
    <div class="ms">${L('注销将解除本机绑定并注销本人身份信息，本机不再保留该用户的认证凭据。',
      'This unbinds the device and removes your credentials from it.')}</div>
    <div class="mbtns"><button class="ghost" data-act="mClose">${L('取消','Cancel')}</button>
      <button class="danger" data-act="delOk">${L('确认注销','Deactivate')}</button></div>`;

  /* 本机绑定用户数已达上限：点「新账号注册」时提示，不再进入绑定页（v1.8） */
  if (k === 'limit') return `
    <div class="mt">${L('本机绑定用户已达上限','Device user limit reached')}</div>
    <div class="ms">${L(`本机已绑定 ${S.userCount} 个用户，达到「终端允许绑定用户数」上限（${S.maxUsers} 个）。需先由其中一个用户在账号设置里注销，才能再绑定新用户。`,
      `This device already has ${S.userCount} users — the limit is ${S.maxUsers}. Deactivate one user in account settings before binding a new one.`)}</div>
    <div class="mbtns"><button data-act="mClose">${L('知道了','Got it')}</button></div>`;

  return '';
}

/* ============================================================
   交互
   ============================================================ */
function toast(msg, cls = ''){
  $('toast').className = 'toast' + (cls ? ' ' + cls : '');
  $('toast').innerHTML = `<i class="ic ic-ok"></i><span>${msg}</span>`;
  $('toast').hidden = false;
  clearTimeout(window.__tt);
  window.__tt = setTimeout(() => { $('toast').hidden = true; }, 1800);
}

function startSms(btnEl){
  if (S.smsLeft) return;
  S.smsLeft = 60;
  toast(L('验证码已发送，请查收','Code sent'));
  clearInterval(smsTimer);
  smsTimer = setInterval(() => {
    S.smsLeft--;
    if (S.smsLeft <= 0){ clearInterval(smsTimer); S.smsLeft = 0; }
    document.querySelectorAll('.codeBtn').forEach(b => {
      b.disabled = S.smsLeft > 0;
      b.textContent = S.smsLeft > 0 ? S.smsLeft + ' s' : L('获取验证码','Send code');
    });
  }, 1000);
  document.querySelectorAll('.codeBtn').forEach(b => { b.disabled = true; b.textContent = '60 s'; });
}

function success(tip){
  $('deskTip').textContent = tip || L('已进入操作系统桌面','You are on the desktop');
  $('desktop').classList.add('show');
}

/* 新增用户工号：首次登录后从 s00000123 起依次递增 */
function nextUid(){
  return 's' + String(S.newSeq++).padStart(8, '0');
}

/* 把本次认证的身份写进本机绑定关系（沁 2026-10-30）：
   · 首次登录 → 替换本机唯一用户，锁屏回登录页时左下立刻出现新工号
   · 新账号注册 → 追加一个用户，左下多一个工号 */
function commitBind(){
  if (S.bindDone) return;
  if (S.page !== 'first' && S.page !== 'register') return;
  let u;
  if (S.domain){
    /* 加域设备（v2.0）：绑定的是「本机域账号 ↔ 统一身份账号」，
       账号与工号都是域账号 s9000XXXX，姓名 / 英文名 / 部门从域目录取 */
    u = domainUser(String(S.form.osAcc || S.form.bosAcc || osList()[0]));
  } else {
    const accIn = String(S.form.acc || '').trim();
    /* 有输入就用输入值（账密 / 口令 / 短信）；扫码 / 人脸 / 指纹无输入 → 默认 shenmuqing · 沈慕青 */
    const acc = accIn || 'shenmuqing';
    const nm  = accIn ? nmOf(accIn) : '沈慕青';
    const win = S.autoCreate ? acc : String(S.form.osAcc || S.form.bosAcc || S.osAccs[1]);
    u = { nm, acc, id: nextUid(), av: nm.slice(0, 1), win,
          pw: S.newPw || String(S.form.pw || '').trim() || INIT_PW,
          methods: methodsOf(acc) };
  }
  if (S.page === 'first'){
    USERS[0] = u; S.userCount = 1; S.user = 0;
  } else {
    USERS.splice(S.userCount, 0, u);
    S.userCount += 1; S.user = S.userCount - 1;
  }
  S.bound = 'yes';
  S.bindDone = true;
  S.newPw = '';   /* 用过就清掉，别带到下一个用户身上（v2.2） */
}

/* 绑定成功：先给「账号绑定成功」提示，再进桌面 */
function bindSuccess(tip){
  commitBind();
  S.bound = 'yes';
  toast(L('账号绑定成功','Account bound successfully'), 'mid');
  setTimeout(() => success(tip || L('账号绑定成功，正在进入系统','Bound — signing in')), 900);
}

/* 认证链收尾（日常）：第一因素通过 → （策略要求时）二次验证 → 代填收尾 → 进桌面 */
function afterDailyAuth(first, tip){
  S.secFirst = first;
  if (S.sec === 'on' && !S.secDone){
    S.pending = 'desk';
    S.pendingTip = tip || '';
    S.sub = 'sec';
    return render();
  }
  return osGate(tip);
}

/* 代填操作系统密码的收尾（v1.7）：正常 → 进桌面；失败 → 按后台「统一改密」开关分流
   · A 开关开启：把 OS 密码统一改成 IAM 密码 → 提示后继续登录
   · B 开关关闭：自动拉起「重新关联 OS 凭证」界面，让用户重填一次 OS 账号与密码
   客户端只按开关走分支，不自己判断该用哪条 */
function osGate(tip){
  if (S.page === 'daily' && !S.osDone && S.osFill !== 'ok'){
    S.pendingTip = tip || '';
    S.err = '';
    S.sub = S.osFill === 'unify' ? 'osUnify' : 'rebind';
    return render();
  }
  success(tip);
}

/* 首次登录：先落绑定关系（左下出现工号），再按策略插入二次验证
   沁 2026-10-30：二次验证发生在「认证 + 绑定之后」 */
function afterFirstAuth(first, tip){
  S.secFirst = first;
  commitBind();
  if (S.sec === 'on' && !S.secDone){
    S.pending = 'desk';
    toast(L('账号绑定成功','Account bound successfully'), 'mid');
    S.sub = 'sec';
    return render();
  }
  bindSuccess(tip);
}

function resetAll(){
  // 从桌面回到登录界面 = 锁屏；本机还有绑定用户 → 日常登录，已无用户 → 回到首次登录
  $('desktop').classList.remove('show');
  S.page = S.userCount > 0 ? 'daily' : 'first';
  S.bound = S.userCount > 0 ? 'yes' : 'no';
  if (!USERS[S.user]) S.user = 0;
  S.form = {}; S.err = ''; S.sub = null; S.step = 0; S.eye = {}; S.qrFail = false;
  S.panel = null; S.skinOpen = false; S.escPop = false; S.cap = false; S.capOk = false;
  S.faceErr = false; M = null; S.secDone = false; S.pending = null; S.pwWhy = '';
  S.bindDone = false; S.secMethod = 'sms'; S.smsLeft = 0;
  S.osDone = false; S.pendingTip = ''; S.secFirst = 'pwd';
  S.newPw = '';   /* 首登改密留下的新密码不跨场景带（v2.2） */
  if (S.userCount > 0 && !USERS[S.user].methods.includes(S.method)) S.method = USERS[S.user].methods[0];
  render();
}

function setPage(p){
  S.page = p; S.panel = null; S.sub = null; S.step = 0; S.err = ''; S.pwWhy = '';
  S.form = {}; S.qrFail = false; M = null; S.secDone = false; S.pending = null;
  S.bindDone = false; S.secFirst = 'pwd'; S.secMethod = 'sms'; S.smsLeft = 0;
  S.osDone = false; S.pendingTip = '';
  if (p === 'first' || p === 'offline') S.method = 'pwd';
  render();
}

function setMethod(m){
  if (!USERS[S.user].methods.includes(m) && S.userCount > 0) return;
  S.method = m; S.sub = null; S.err = ''; S.pwWhy = ''; S.form = {}; S.qrFail = false;
  S.secDone = false; S.pending = null; S.secMethod = 'sms'; S.smsLeft = 0;
  S.osDone = false; S.pendingTip = '';
  render();
}

function openPanel(){ S.panel = 'accp'; render(); }
function closePanel(){ if (!S.panel) return; S.panel = null; render(); }

/* —— 登录校验 —— */
function doLogin(){
  if (S.page === 'offline') return doOfflineLogin();
  if (S.method === 'pwd'){
    const pw = ($('pw') || {}).value || '';
    if (!pw){ S.err = L('请填写登录密码','Please enter your password'); return render(); }
    /* v2.2：密码不再靠演示开关「假装错」，直接跟该用户保存的密码比对
       （内置用户初始密码 123456；首次登录填的密码会存成他的密码） */
    const expect = (USERS[S.user] || {}).pw || INIT_PW;
    if (pw !== expect){ S.err = L('密码不正确，请重新输入','Incorrect password'); return render(); }
    S.err = '';
    /* 初始密码：先改密再进系统（与首次登录同一处理，沁 2026-10-29） */
    if (S.pwdState === 'initpw'){ S.sub = 'firstPw'; return render(); }
    if (S.pwdState === 'expired'){ S.sub = 'pwExpNotice'; return render(); }
    if (S.pwdState === 'expiring'){ S.sub = 'pwSoonNotice'; return render(); }
    return afterDailyAuth('pwd', L('已通过「账号密码」进入系统','Signed in with password'));
  }
  if (S.method === 'sms'){
    // 手机号由后台带出（脱敏只读），只校验验证码
    const cd = ($('code') || {}).value || '';
    if (!cd){ S.err = L('请输入验证码','Please enter the code'); return render(); }
    if (cd !== S.smsCode){ S.err = L('验证码不正确','Incorrect code'); return render(); }
    S.err = '';
    return afterDailyAuth('sms', L('已通过「短信验证码」进入系统','Signed in with SMS'));
  }
  if (S.method === 'otp'){
    const o = ($('otp') || {}).value || '';
    if (!o){ S.err = L('请填写动态口令','Please enter the one-time password'); return render(); }
    if (o !== '123456'){ S.err = L('用户名或动态口令不正确','Incorrect account or OTP'); return render(); }
    S.err = '';
    return afterDailyAuth('otp', L('已通过「动态口令」进入系统','Signed in with OTP'));
  }
}

/* —— 离线校验（本地，不连认证服务） ——
   v1.7：账密 = 统一身份账号 + 统一身份密码；动态口令 = 离线口令；人脸 / 指纹走本地生物识别 */
function doOfflineLogin(){
  if (S.method === 'qr' || S.method === 'sms') return;   // 仅在线方式，没有提交入口

  if (S.method === 'otp'){
    const o = ($('otp') || {}).value || '';
    if (!o){ S.err = L('请填写动态口令','Please enter the OTP'); return render(); }
    if (o !== '123456'){ S.err = L('动态口令不正确','Incorrect OTP'); return render(); }
    S.err = ''; toast(L('离线认证通过','Offline verified'));
    return success(L('离线动态口令通过，已进入系统','Offline OTP — signed in'));
  }

  if (S.method !== 'pwd') return;

  /* 从未用过账密的用户：本机没有可校验的凭据，账密降级为仅在线 */
  if (S.offPwd === 'no'){
    S.err = L('该账号不支持离线账密，请改用离线动态口令 / 人脸 / 指纹',
              'No offline password on this device — use OTP / face / fingerprint');
    return render();
  }
  const p = ($('opw') || {}).value || '';
  if (!p){ S.err = L('请填写统一身份密码','Please enter the identity password'); return render(); }
  /* v2.3：离线账密只输密码 —— 账号就是当前绑定的用户，本机缓存里校验 */
  const expect = (USERS[S.user] || {}).pw || INIT_PW;
  if (p !== expect){ S.err = L('密码不正确，请重新输入','Incorrect password'); return render(); }
  S.err = ''; toast(L('离线认证通过','Offline verified'));
  return success(L('离线账密通过，已进入系统','Offline password — signed in'));
}

/* —— 首次登录校验 —— */
function doFirstLogin(){
  const acc = ($('acc') || {}).value || '';
  const osp = ($('osPw') || {}).value || '';
  if (acc) S.form.acc = acc;

  if (S.method === 'pwd'){
    if (!acc){ S.err = L('请填写统一身份用户名','Please enter the identity username'); return render(); }
    const pw = ($('pw') || {}).value || '';
    if (!pw){ S.err = L('请填写统一身份密码','Please enter the identity password'); return render(); }
    if (!S.autoCreate && !osp){ S.err = L('请填写 Windows 本地账户密码','Please enter the Windows password'); return render(); }
  } else if (S.method === 'otp'){
    if (!acc){ S.err = L('请填写统一身份用户名','Please enter the identity username'); return render(); }
    const o = ($('otp') || {}).value || '';
    if (!o){ S.err = L('请填写动态口令','Please enter the OTP'); return render(); }
    if (!osp){ S.err = L('请填写 Windows 本地账户密码','Please enter the Windows password'); return render(); }
  } else if (S.method === 'sms'){
    /* 短信：先填统一身份账号 → 客户端按账号带出绑定手机号 → 再取码 */
    if (!acc){ S.err = L('请填写统一身份账号','Please enter the identity account'); return render(); }
    if (!phoneOf(acc)){ S.err = L('该账号未绑定手机号，无法接收验证码','No phone bound to this account'); return render(); }
    const cd = ($('code') || {}).value || '';
    if (!cd){ S.err = L('请填写验证码','Please enter the code'); return render(); }
    if (cd !== S.smsCode){ S.err = L('验证码不正确','Incorrect code'); return render(); }
    if (!S.autoCreate && !osp){ S.err = L('请填写 Windows 本地账户密码','Please enter the Windows password'); return render(); }
  }

  /* 一个用户在一台设备上只能绑一次（v1.8）：输入的账号已在本机绑定过 → 不允许重复绑定 */
  if (acc){
    const dup = findBound(acc);
    if (dup){
      S.err = L(`该用户已绑定本机（${dup.nm} · ${dup.id}），不允许重复绑定，请直接登录或切换用户`,
                `This user is already bound to this device (${dup.nm} · ${dup.id})`);
      return render();
    }
  }

  /* 绑定超限：不跳独立页面，直接在本页作为错误提示展示（沁 2026-10-30） */
  if (S.anomaly === 'bound3'){
    S.err = L(`绑定失败，您已绑定 ${S.maxDev || 3} 台设备，达到绑定数量上限`,
              `Binding failed — this account has reached the ${S.maxDev || 3}-device limit`);
    return render();
  }
  if (S.anomaly === 'os3'){
    S.err = L(`绑定失败，此操作系统账号已绑定 ${S.maxUser || 3} 个用户，达到绑定数量上限`,
              'Binding failed — this OS account has reached the user limit');
    return render();
  }

  S.err = '';
  if (S.pwdState === 'initpw'){ S.sub = 'firstPw'; return render(); }   // 初始密码 → 强制改密
  if (S.autoCreate){ S.sub = 'osPreview'; return render(); }            // 认证区变预览确认，不弹窗
  afterFirstAuth(S.method);                                             // 绑定 →（策略）二次验证 → 桌面
}

/* ============================================================
   事件
   ============================================================ */
document.addEventListener('input', e => {
  const id = e.target.id;
  if (!id) return;
  if (M && $('modal').contains(e.target)) S.mForm[id] = e.target.value;
  else S.form[id] = e.target.value;
  /* 首次登录 · 短信：账号一变就按账号重新带出绑定手机号，并解锁验证码输入（不重渲染，保住焦点） */
  if (id === 'acc' && S.method === 'sms' && S.page !== 'daily'){
    const ph = phoneOf(e.target.value);
    const pf = $('phone'), cf = $('code');
    const cb = document.querySelector('#panel .code-in');
    if (pf){ pf.value = ph; S.form.phone = ph; }
    if (cf) cf.disabled = !ph;
    if (cb && !S.smsLeft) cb.disabled = !ph;
  }
  const clr = document.querySelector(`[data-clr-for="${id}"]`);
  if (clr) clr.hidden = !String(e.target.value || '').length;
  const eye = document.querySelector(`[data-eye-for="${id}"]`);
  if (eye) eye.hidden = !String(e.target.value || '').length;
  /* 用户一改新密码，就撤掉上一次的「差在哪」提示（不重渲染，避免丢焦点） */
  if (S.pwWhy && (id === 'ip1' || id === 'np1')){
    S.pwWhy = '';
    const w = document.querySelector('.pwwhy'); if (w) w.remove();
    const bw = document.querySelector('.pwwrap.bad'); if (bw) bw.classList.remove('bad');
  }
  syncSubmit();
});

document.addEventListener('change', e => {
  if (e.target.dataset.act === 'lang'){
    S.lang = e.target.value; render();
  }
  if (e.target.dataset.act === 'contact'){
    S.contact = e.target.value; S.smsLeft = 0; S.form.code = ''; render();
  }
  if (e.target.dataset.act === 'osType'){ S.osType = e.target.value; }
  /* 加域设备（v2.0）：在下拉里换一个域账号 → 统一身份账号跟着变（两者本来就是同一个号） */
  if (e.target.dataset.act === 'osAcc'){
    S.dmOs = e.target.value;
    S.form.osAcc = e.target.value;
    S.form.acc = osNum(e.target.value);
    S.err = '';
    render();
  }
  if (e.target.dataset.act === 'rbAcc'){ S.form.rbAcc = e.target.value; S.form.acc = osNum(e.target.value); }
});

document.addEventListener('click', e => {
  // 图标条
  const ci = e.target.closest('.ci');
  if (ci && ci.dataset.m){ setMethod(ci.dataset.m); return; }
  // 用户切换
  const uEl = e.target.closest('.u');
  if (uEl){
    /* v2.1：点左下用户 = 切到该用户的日常登录页（单用户也一样）；
       账号设置改由右下齿轮进入，两个入口不再抢同一块区域（沁 2026-11-02） */
    S.user = +uEl.dataset.u;
    S.page = 'daily';
    S.sub = null; S.step = 0; S.err = '';
    S.form = {}; S.eye = {};
    S.panel = null; S.skinOpen = false; S.escPop = false;
    S.cap = false; S.capOk = false; S.qrFail = false; M = null;
    S.secDone = false; S.pending = null; S.pwWhy = '';
    if (!USERS[S.user].methods.includes(S.method)) S.method = USERS[S.user].methods[0];
    render(); return;
  }
  // 系统功能栏
  const si = e.target.closest('.si');
  if (si){ onSys(si.dataset.s); return; }
  // 点面板外 → 收起账号设置面板（弹窗打开时点遮罩不算）
  if (S.panel && !e.target.closest('#accp') && !e.target.closest('#modal') && !e.target.closest('#ov')){
    closePanel();
    if (!e.target.closest('[data-act]')) return;
  }
  // 点外 → 收起换肤 / 逃生浮层
  if (S.skinOpen && !e.target.closest('#skinp') && !e.target.closest('#skin')){
    S.skinOpen = false; render();
  }
  if (S.escPop && !e.target.closest('#escp') && !e.target.closest('.si')){
    S.escPop = false; S.err = ''; render();
  }
  // 点空白关浮层
  if (!e.target.closest('#pop') && !$('pop').hidden){ $('pop').hidden = true; }

  const t = e.target.closest('[data-act]');
  if (!t) return;
  const a = t.dataset.act;
  act(a, t);
});

function onSys(k){
  if (k === 'shezhi'){
    if (S.panel){ closePanel(); return; }
    openPanel(); return;
  }
  if (k === 'adduser'){
    /* 绑定上限：本机已绑满（演示约束 3 个用户）→ 先提示，不进入绑定页（v1.8） */
    if (S.userCount >= S.maxUsers){ openModal('limit'); return; }
    setPage('register'); return;
  }
  if (k === 'escape'){ S.escPop = true; S.err = ''; render(); return; }
  if (k === 'wifi'){
    // 系统网络面板：弹出网络列表，可选择 / 切换网络（不属于账号设置）
    showPop(`<div class="ph">${L('无线网络','WIRELESS NETWORK')}</div>
      ${S.nets.map(n => `<div class="mi" data-act="netPick" data-n="${n.n}">
          <i class="ic ic-wifi"></i><span>${n.n}</span>
          <span class="r">${n.n === S.net ? '✓ ' + L('已连接','Connected')
                                        : (n.lock ? L('需密码','Secured') : '')}</span></div>`).join('')}
      <div class="hr"></div>
      <div class="mi" style="cursor:default"><i class="ic ic-wifi"></i>
        <span>${L('当前：','Current: ')}${S.net}</span></div>`);
    return;
  }
  if (k === 'batt'){
    showPop(`<div class="ph">${L('电量','BATTERY')}</div>
      <div class="mi" style="cursor:default"><i class="ic ic-dianchi"></i>
        <span>76%</span><span class="r">${L('剩余 3 小时 20 分','3h 20m left')}</span></div>`);
    return;
  }
  if (k === 'power'){
    showPop(`<div class="mi" data-p="off"><i class="ic ic-guanji"></i><span>${L('关机','Shut down')}</span></div>
      <div class="mi" data-p="restart"><i class="ic ic-chongqi"></i><span>${L('重启','Restart')}</span></div>`);
    return;
  }
}

function showPop(html){
  // 浮层互斥：开系统浮层就收起账号设置面板
  if (S.panel){ S.panel = null; render(); }
  const p = $('pop');
  p.innerHTML = html;
  p.className = 'pop right';
  p.hidden = false;
  p.querySelectorAll('[data-p]').forEach(el => el.onclick = () => {
    p.hidden = true;
    toast(el.dataset.p === 'off' ? L('演示：已执行关机','Demo: shut down') : L('演示：已执行重启','Demo: restart'));
  });
}

function act(a, el){
  switch (a){
    case 'eye': { const id = el.dataset.id; S.eye[id] = !S.eye[id]; render(); break; }
    case 'clear': { const id = el.dataset.id; S.form[id] = ''; S.err = ''; render(); break; }
    case 'autoCreate': S.autoCreate = !S.autoCreate; render(); break;

    case 'login': doLogin(); break;
    case 'faceOk': return afterDailyAuth('face', L('已通过「人脸识别」进入系统','Signed in with face'));
    case 'faceFail': S.faceErr = true; render(); break;
    case 'faceRetry': S.faceErr = false; toast(L('正在重新检测摄像头…','Retrying camera…')); render(); break;
    case 'fingerOk': return afterDailyAuth('finger', L('已通过「指纹」进入系统','Signed in with fingerprint'));

    case 'qrScan': return afterDailyAuth('qr', L('扫码成功，已进入系统','Scanned — signed in'));
    /* 首次登录扫码：先认证 → 绑定页 → （策略）二次验证 → 桌面 */
    case 'qrScanFirst': S.secFirst = 'qr'; S.sub = 'bind'; render(); break;
    case 'qrFail': S.qrFail = true; render(); break;
    case 'qrRefresh': S.qrFail = false; render(); break;
    case 'qrOfflineRefresh':
      toast(L('网络异常，仍无法获取二维码','Still offline — cannot load the QR code'));
      render(); break;

    /* v1.7 · 离线：人脸 / 指纹走本地生物识别，不依赖服务 */
    case 'offFaceOk':
      toast(L('离线认证通过','Offline verified'));
      return success(L('离线人脸通过，已进入系统','Offline face — signed in'));
    case 'offFingerOk':
      toast(L('离线认证通过','Offline verified'));
      return success(L('离线指纹通过，已进入系统','Offline fingerprint — signed in'));

    /* v1.7 · 代填失败 A 路：统一改密完成 → 继续登录（代填状态同时复位为正常） */
    case 'osUnifyGo':
      S.osDone = true; S.osFill = 'ok'; render();
      return afterDailyAuth(S.secFirst || 'pwd',
        S.pendingTip || L('操作系统密码已统一，已进入系统','OS password unified — signed in'));

    /* v1.7 · 代填失败 B 路：重新关联 OS 凭证 → 关联成功继续登录（代填状态同时复位为正常） */
    case 'rebindOk': {
      const acc = ($('rbAcc') || {}).value || '', pw = ($('rbPw') || {}).value || '';
      if (!acc){ S.err = L('请选择 OS 账号','Please select an OS account'); return render(); }
      if (!pw){ S.err = L('请填写该 OS 账号的密码','Please enter the OS account password'); return render(); }
      if (pw !== '123456'){ S.err = L('操作系统密码不正确','Incorrect OS password'); return render(); }
      S.err = ''; S.osDone = true; S.osFill = 'ok';
      if (acc) USERS[S.user].win = acc;
      S.form.rbPw = '';
      toast(L('已重新关联操作系统账号','OS account re-linked'));
      return afterDailyAuth(S.secFirst || 'pwd',
        S.pendingTip || L('已重新关联操作系统账号，进入系统','Re-linked — signed in'));
    }

    /* 获取验证码 → 先过滑块拼图，通过后才发码 */
    case 'sendSms': case 'sendSms2': case 'sendSms3': case 'sendSms4':
      if (S.smsLeft) return;
      S.cap = true; S.capOk = false; render(); break;
    case 'capClose': S.cap = false; S.capOk = false; render(); break;
    case 'fillCode': { const c = $('code'); if (c){ c.value = S.smsCode; S.form.code = S.smsCode; } syncSubmit(); break; }

    /* 换肤 */
    case 'wall': S.wall = +el.dataset.i; applyWall(); render(); break;

    /* —— 忘记密码 —— */
    /* —— 忘记密码（设计稿 3.6.1：单页 = 身份认证 + 设新密码） —— */
    case 'forgot': S.sub = 'forgot'; S.step = 0; S.err = ''; S.form = {}; render(); break;
    case 'forgotDone': {
      const c = ($('code') || {}).value || '';
      const p1 = ($('np1') || {}).value || '', p2 = ($('np2') || {}).value || '';
      S.pwWhy = '';
      if (!c){ S.err = L('请输入验证码','Please enter the code'); return render(); }
      if (c !== S.smsCode){ S.err = L('验证码不正确','Incorrect code'); return render(); }
      if (!p1 || !p2){ S.err = L('请填写新密码','Please enter the new password'); return render(); }
      if (p1 !== p2){ S.err = L('两次输入的密码不一致，请重新输入','Passwords do not match'); return render(); }
      if (!strong(p1)){
        S.err = L('密码格式不正确，请重新输入','Invalid password format');
        S.pwWhy = pwWhy(p1); return render();
      }
      S.err = ''; S.sub = 'forgotOk'; S.cd = 6; render(); forgotCountdown(); break;
    }
    case 'forgotGo': clearInterval(window.__cd); success(L('已进入操作系统','Signed in')); break;
    case 'forgotBack': clearInterval(window.__cd); S.sub = null; S.step = 0; S.err = ''; S.form = {}; render(); break;

    /* —— 密码安全：身份验证 → 改密 —— */
    case 'pwdSecOk': {
      const c = ($('code') || {}).value || '', p1 = ($('np1') || {}).value || '', p2 = ($('np2') || {}).value || '';
      if (!c){ S.err = L('请输入验证码','Please enter the code'); return render(); }
      if (c !== S.smsCode){ S.err = L('验证码不正确','Incorrect code'); return render(); }
      if (!p1 || !p2){ S.err = L('请填写新密码','Please enter the new password'); return render(); }
      if (p1 !== p2){ S.err = L('两次输入的密码不一致，请重新输入','Passwords do not match'); return render(); }
      if (!strong(p1)){
        S.err = L('密码格式不正确，请重新输入','Invalid password format');
        S.pwWhy = pwWhy(p1); return render();
      }
      S.err = ''; S.sub = null; S.form = {}; render();
      toast(L('密码修改成功','Password changed')); break;
    }
    case 'pwdSecBack': S.sub = null; S.err = ''; S.form = {}; render(); break;

    /* —— 密码到期 —— */
    case 'expGo': S.sub = 'pwExpForm'; S.err = ''; render(); break;
    case 'expBack': S.sub = null; S.err = ''; render(); break;
    case 'doExpire': {
      const p1 = ($('np1') || {}).value || '', p2 = ($('np2') || {}).value || '';
      S.pwWhy = '';
      if (!p1 || !p2){ S.err = L('请填写新密码','Please enter the new password'); return render(); }
      if (p1 !== p2){ S.err = L('两次输入的密码不一致，请重新输入','Passwords do not match'); return render(); }
      if (!strong(p1)){
        S.err = L('密码格式不正确，请重新输入','Invalid password format');
        S.pwWhy = pwWhy(p1); return render();
      }
      S.err = ''; S.sub = null;
      /* v2.2：过期改密同样落到该用户名下，下次登录用新密码 */
      if (USERS[S.user]) USERS[S.user].pw = p1;
      toast(L('修改成功','Password changed'));
      return afterDailyAuth('pwd', L('密码已修改，已进入系统','Password changed — signed in'));
    }
    case 'skipExpire':
      return afterDailyAuth('pwd', L('已跳过改密，进入系统','Skipped — signed in'));

    /* —— 二次验证（第二因素，方式与第一因素不同） —— */
    case 'secOk': {
      const m = S.secMethod;
      let v = '';
      if (m === 'sms')      v = ($('scode') || {}).value || '';
      else if (m === 'otp') v = ($('sotp')  || {}).value || '';
      else if (m === 'pwd') v = ($('spw')   || {}).value || '';

      if (m === 'sms' || m === 'otp'){
        if (!v){ S.err = m === 'sms' ? L('请输入验证码','Please enter the code')
                                     : L('请填写动态口令','Please enter the OTP'); return render(); }
        if (v !== '123456'){ S.err = m === 'sms'
          ? L('验证码不正确','Incorrect code')
          : L('用户名或动态口令不正确','Incorrect account or OTP'); return render(); }
      } else if (m === 'pwd'){
        if (!v){ S.err = L('请输入登录密码','Please enter your password'); return render(); }
        if (S.pwdState === 'wrong'){ S.err = L('密码不正确，请重新输入','Incorrect password'); return render(); }
      }
      /* 扫码 / 人脸 / 指纹：本机完成校验即视为通过 */
      S.err = ''; S.secDone = true; S.pending = null; S.sub = null;
      S.form.scode = ''; S.form.sotp = ''; S.form.spw = '';
      commitBind(); render();
      /* 二次验证之后还有代填收尾：正常进桌面，失败按开关分流（v1.7） */
      osGate(S.pendingTip || L('二次验证通过，已进入系统','Verified — signed in')); break;
    }
    case 'secBack':
      S.sub = null; S.secDone = false; S.pending = null; S.secMethod = 'sms';
      S.err = ''; S.form.scode = ''; S.form.sotp = ''; S.form.spw = '';
      render(); break;

    /* —— 首次登录 —— */
    case 'firstLogin': doFirstLogin(); break;
    case 'bindLogin': {
      const bo = ($('bosAcc') || {}).value || '', bp = ($('bosPw') || {}).value || '';
      if (!bo){ S.err = L('请选择 Windows 账号','Please select a Windows account'); return render(); }
      if (!bp){ S.err = L('请填写 Windows 本地账户密码','Please enter the Windows password'); return render(); }
      if (bp !== '123456'){ S.err = L('操作系统密码不正确','Incorrect Windows password'); return render(); }
      /* 一个用户在一台设备上只能绑一次（v1.8） */
      const dup = findBound(S.form.acc || 'shenmuqing');
      if (dup){
        S.err = L(`该用户已绑定本机（${dup.nm} · ${dup.id}），不允许重复绑定，请直接登录`,
                  `This user is already bound to this device (${dup.nm} · ${dup.id})`);
        return render();
      }
      S.err = '';
      afterFirstAuth(S.secFirst || 'qr');   // 绑定完成 →（策略）二次验证 → 桌面
      break;
    }
    case 'firstPwOk': {
      const p1 = ($('ip1') || {}).value || '', p2 = ($('ip2') || {}).value || '';
      S.pwWhy = '';
      if (!p1 || !p2){ S.err = L('请填写新密码','Please enter the new password'); return render(); }
      if (p1 !== p2){ S.err = L('两次输入的密码不一致，请重新输入','Passwords do not match'); return render(); }
      if (!strong(p1)){
        S.err = L('密码格式不正确，请重新输入','Invalid password format');
        S.pwWhy = pwWhy(p1);            // 指出具体差哪条，避免用户反复试
        return render();
      }
      S.err = ''; S.form.ip1 = ''; S.form.ip2 = '';
      S.eye = {}; S.pwdState = 'ok'; S.sub = null;
      /* v2.2：新密码落到该用户名下 —— 首次登录时还没建用户，先存起来，绑定那一步再写进去 */
      if (S.page === 'first' || S.page === 'register') S.newPw = p1;
      else if (USERS[S.user]) USERS[S.user].pw = p1;
      toast(L('修改成功','Password changed'));
      /* 改密之后继续原流程：首次登录走绑定，日常登录走二次验证 → 进桌面 */
      if (S.page === 'first' || S.page === 'register'){
        if (S.autoCreate){ S.sub = 'osPreview'; return render(); }
        return afterFirstAuth('pwd');
      }
      return afterDailyAuth('pwd', L('密码已修改，已进入系统','Password changed — signed in'));
    }
    /* 人脸 / 指纹：本机生物特征已绑定，校验通过即可
       注册页 → 直接绑定成功进桌面；首次登录 → 转绑定页填 Windows 账号 */
    case 'faceFirst':
    case 'fingerFirst': {
      const fm = a === 'faceFirst' ? 'face' : 'finger';
      S.secFirst = fm;
      if (S.page === 'register') return afterFirstAuth(fm);
      S.sub = 'bind'; render(); break;
    }

    case 'goDaily': setPage('daily'); break;

    /* —— 逃生登录 ——
       沁 2026-10-30：授权码不再校验固定值，任意输入均放行；
       也不再写 S.err，避免和账密认证失败的提示串在一起 */
    case 'escOk':
    case 'escUnlock': {
      const v = String(($('esc') || {}).value || '').trim();
      if (!v) return;
      S.escPop = false; S.form.esc = ''; S.eye = {};
      render();
      $('native').classList.add('show'); break;
    }
    case 'escClose': S.escPop = false; render(); break;

    /* —— 账号设置面板 —— */
    case 'netPick':
      S.net = el.dataset.n; toast(L('已切换到 ','Switched to ') + el.dataset.n);
      onSys('wifi'); render(); break;
    case 'chIdPw': S.panel = null; S.sub = 'pwdSec'; S.err = ''; S.form = {}; render(); break;
    case 'chWin': openModal('auth', { intent:'win' }); break;
    case 'delAcc': openModal('auth', { intent:'deact' }); break;

    /* —— 弹窗 —— */
    case 'mClose': closeModal(); break;
    case 'osConfirm': S.sub = null; afterFirstAuth('pwd'); break;
    case 'createdOk': closeModal(); afterFirstAuth('pwd'); break;
    case 'pwdOk': {
      const c = ($('cp') || {}).value || '', n1 = ($('np') || {}).value || '', n2 = ($('np2') || {}).value || '';
      if (!c){ S.mErr = L('请填写原密码','Please enter the current password'); return renderModal(); }
      if (!n1){ S.mErr = L('请填写新密码','Please enter the new password'); return renderModal(); }
      if (n1 !== n2){ S.mErr = L('两次输入的密码不一致','Passwords do not match'); return renderModal(); }
      if (!strong(n1)){ S.mErr = L('密码格式不正确，请重新输入','Invalid password format'); return renderModal(); }
      if (USERS[S.user]) USERS[S.user].pw = n1;   // v2.2：主动改密也落到该用户
      closeModal(); toast(L('修改成功','Password changed')); break;
    }
    case 'authDemo': { const i = $('apw'); if (i) i.value = ID_PW; S.mErr = ''; break; }
    case 'authOk': {
      const v = ($('apw') || {}).value || '';
      if (!v){ S.mErr = L('请输入密码','Please enter your password'); return renderModal(); }
      if (v !== ID_PW){ S.mErr = L('密码不正确，请重新输入','Incorrect password'); return renderModal(); }
      const it = M.intent; S.mErr = '';
      M = { k: it === 'win' ? 'win' : 'del' }; renderModal(); break;
    }
    case 'winOk': {
      const acc = ($('wacc') || {}).value || '', pw = ($('wpw') || {}).value || '';
      if (!acc){ S.mErr = L('请选择 Windows 账号','Choose a Windows account'); return renderModal(); }
      if (!pw){ S.mErr = L('请输入该账号的 Windows 本地密码','Enter the Windows password for this account'); return renderModal(); }
      USERS[S.user].win = acc; closeModal(); render();
      toast(L('Windows 账号已更换为 ','Windows account changed to ') + acc); break;
    }
    case 'delOk': deactivate(); break;
  }
}

/* 注销：本机还有别的用户 → 切到该用户；没有 → 回首次登录页（左下工号一并消失）
   沁 2026-10-30：注销要把该用户从本机用户列表里真正移除 */
function deactivate(){
  closeModal();
  USERS.splice(S.user, 1);
  S.userCount = Math.max(0, S.userCount - 1);
  S.user = 0;
  S.bindDone = false;
  S.panel = null;
  if (S.userCount > 0){
    S.bound = 'yes';
    setPage('daily');
    setTimeout(() => toast(L('已注销，已切到该用户的登录界面','Deactivated — switched user')), 60);
  } else {
    S.bound = 'no';
    setPage('first');
    setTimeout(() => toast(L('已注销，本机已无绑定用户','Deactivated — no users left')), 60);
  }
}

/* 密码规则（与密码要求气泡 3.6.8 一一对应） */
const WEAK = ['12345678','123456789','11111111','88888888','abcdefgh','password','passw0rd','qwertyui','admin123','iloveyou'];
function pwRules(p){
  const s = String(p || '');
  const cats = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/].filter(r => r.test(s)).length;
  return {
    len:  s.length >= 8 && s.length <= 20,
    cat:  cats >= 3,
    weak: !WEAK.includes(s.toLowerCase())
  };
}
/* 一条一句话说清差在哪 —— 避免「一直提示格式不正确」却不知道改什么 */
function pwWhy(p){
  const s = String(p || ''), r = pwRules(s);
  if (!r.len)  return L('长度需为 8~20 个字符','Length must be 8–20 characters');
  if (!r.cat)  return L('需包含数字、大写字母、小写字母、特殊字符中的至少 3 类',
                       'Use at least 3 of digits / lower / upper / symbols');
  if (!r.weak) return L('不能使用常见弱口令','This is a common weak password');
  return '';
}
function strong(p){
  const r = pwRules(p);
  return r.len && r.cat && r.weak;
}

function forgotCountdown(){
  clearInterval(window.__cd);
  window.__cd = setInterval(() => {
    S.cd--;
    if (S.cd <= 0){ clearInterval(window.__cd); success(L('已进入操作系统','Signed in')); return; }
    if (S.sub === 'forgotOk') render();
  }, 1000);
}

/* ============================================================
   演示控制
   ============================================================ */
/* 演示控制与当前状态同步（v2.1：控制区只选「已绑用户数」，其余全部由它推导）
   · 0 个用户 → 只能是首次登录
   · ≥1 个用户 → 日常登录 / 离线登录 / 绑定新账号
   · ≥2 个用户 → 自动视为公共设备（二次验证写死关闭）
   · 满 3 个用户 → 再点「新账号注册」自动弹上限提示（不需要手动选异常） */
function syncDemo(){
  const pg = $('dPage');
  if (!pg) return;
  const unbound = S.userCount === 0;
  if (pg.dataset.ub !== String(unbound)){
    pg.dataset.ub = String(unbound);
    if (unbound){
      pg.innerHTML = '<option value="first">首次登录</option>';
      pg.disabled = true;
    } else {
      pg.innerHTML = '<option value="daily">日常登录</option>'
                   + '<option value="offline">离线登录</option>'
                   + '<option value="register">绑定新账号</option>';
      pg.disabled = false;
    }
  }
  if (unbound) pg.value = 'first';
  else pg.value = ['daily','offline','register'].includes(S.page) ? S.page : 'daily';

  /* 「已绑用户」选项跟着「绑定上限」走：上限调小后不再列出超出的档位 */
  const us = $('dUsers');
  if (us.dataset.mx !== String(S.maxUsers)){
    us.dataset.mx = String(S.maxUsers);
    let o = '';
    for (let i = 0; i <= S.maxUsers; i++){
      const t = i === 0 ? '0 · 未绑定'
              : i === 1 ? '1 · 单用户'
              : i >= S.maxUsers ? i + ' · 公共设备（满）'
              : i + ' · 公共设备';
      o += `<option value="${i}">${t}</option>`;
    }
    us.innerHTML = o;
  }
  us.value = String(S.userCount);
  /* v2.0：设备是否加域；加域后「自动创建 OS 账号」这套不适用，直接置灰 */
  $('dDomain').value = S.domain ? '1' : '0';
  $('dAuto').disabled = S.domain;
  $('dAuto').title = S.domain ? L('加域设备的账号来自域，不存在「自动创建」','Domain accounts already exist') : '';
  $('dPwd').value = S.pwdState;
  $('dMax').value = String(S.maxUsers);

  /* 公共设备 = 本机绑定 ≥2 个用户共用（v1.9 起按「多用户即公共设备」判定）；
     这类设备策略写死为「不需二次验证」（沁 2026-10-30） */
  const publicDev = S.userCount >= 2;
  if (publicDev && S.sec === 'on'){ S.sec = 'off'; S.secDone = false; S.pending = null; }
  $('dSec').disabled = publicDev;
  $('dSec').title = publicDev ? L('公共设备策略写死为不需二次验证','Public device: 2FA disabled') : '';
  $('dSec').value = S.sec;

  /* 二因素：只有「需二次验证」时才可配（沁 2026-11-02） */
  $('dSecM').value = S.secPolicy;
  $('dSecM').disabled = publicDev || S.sec === 'off';
  $('dSecM').title = $('dSecM').disabled
    ? L('不需要二次验证时，二因素方式不生效','No second factor needed') : '';

  /* v1.7 策略联动项：把当前状态同步回演示控制
     可用性按沁 2026-11-02 的规则：未绑定 → 代填 / 离线置灰；其余按页面判断 */
  const onDaily = S.page === 'daily' || S.page === 'register';
  $('dOs').value = S.osFill;
  $('dOs').disabled = unbound || !onDaily;
  $('dOs').title = unbound ? L('未绑定用户，没有可代填的 OS 凭证','No bound user yet')
                : (!$('dOs').disabled ? '' : L('代填只在日常登录时发生','OS fill applies to daily sign-in'));
  $('dAuto').value = S.allowAuto ? '1' : '0';
  $('dOrder').value = S.order;
  $('dWall').value = String(S.wall);
  $('dOffPwd').value = S.offPwd;
  $('dOffPwd').disabled = unbound || S.page !== 'offline';
}

$('dPage').onchange = e => {
  S.panel = null; S.skinOpen = false; S.escPop = false;
  setPage(e.target.value);
};
$('dDomain').onchange = e => {
  S.domain = e.target.value === '1';
  S.sub = null; S.err = ''; S.pwWhy = ''; S.step = 0; S.eye = {}; S.autoCreate = false;
  S.form = {};
  if (S.domain){
    S.dmOs = osFull(DOMAIN_OS[0]);
    S.form.acc = osNum(S.dmOs);
    if (S.userCount >= 1){
      USERS[0] = domainUser(DOMAIN_OS[0]);
      S.userCount = 1; S.user = 0; S.bound = 'yes'; S.page = 'daily';
    } else { S.page = 'first'; S.bound = 'no'; }
    toast(L('加域设备：身份取自域账号 ','Domain device: identity from ') + S.dmOs, 'mid');
  } else {
    if (S.userCount >= 1){
      USERS[0] = { nm:'沈慕青', acc:'shenmuqing', id:'s00000122', av:'沈',
                   win:'shenmuqing', methods:['pwd','qr','sms','face','otp','finger'] };
      S.userCount = 1; S.user = 0; S.bound = 'yes'; S.page = 'daily';
    } else { S.page = 'first'; S.bound = 'no'; }
    toast(L('不加域设备：身份由用户输入','Non-domain device: identity is typed'), 'mid');
  }
  render();
};
$('dPwd').onchange = e => {
  S.pwdState = e.target.value; S.sub = null; S.err = ''; S.pwWhy = '';
  S.secDone = false; S.pending = null; S.form = {}; render();
};
$('dSec').onchange = e => { S.sec = e.target.value; S.sub = null; S.err = ''; S.secDone = false; S.pending = null; render(); };
/* 二因素：改的是「链上指定用哪种方式」，页面按它渲染（v2.2）；停在当前页，不退回第一因素 */
$('dSecM').onchange = e => { S.secPolicy = e.target.value; S.err = ''; S.smsLeft = 0; render(); };
/* 绑定上限：调小到低于当前人数时，按上限收敛 */
$('dMax').onchange = e => {
  S.maxUsers = +e.target.value;
  if (S.userCount > S.maxUsers) S.userCount = S.maxUsers;
  if (S.user >= S.userCount) S.user = 0;
  if (S.userCount === 0){ S.page = 'first'; S.user = 0; }
  S.sub = null; S.err = ''; render();
};
$('dUsers').onchange = e => {
  const n = +e.target.value;
  const wasUnbound = S.userCount === 0;
  S.userCount = n;
  if (n === 0){
    /* 0 个用户：只能是首次登录 */
    S.user = 0; S.bound = 'no';
    S.secDone = false; setPage('first');
  } else {
    S.bound = 'yes';
    /* 用户数变少时把选中用户拉回有效范围，避免越界 */
    if (S.user >= n) S.user = 0;
    if (n === 1) S.user = 0;
    /* 从「未绑定」切上来 = 本机已有绑定用户 → 日常登录；其余保持当前页面 */
    setPage(wasUnbound ? 'daily' : (S.page === 'offline' ? 'offline' : 'daily'));
  }
  render();
};

/* v1.7 策略联动项的演示开关 */
$('dOs').onchange = e => {
  S.osFill = e.target.value; S.osDone = false; S.pendingTip = '';
  S.sub = null; S.err = ''; render();
};
$('dAuto').onchange = e => {
  S.allowAuto = e.target.value === '1';
  if (!S.allowAuto) S.autoCreate = false;
  S.sub = null; S.err = ''; render();
};
$('dOrder').onchange = e => { S.order = e.target.value; S.sub = null; S.err = ''; render(); };
$('dWall').onchange = e => { S.wall = +e.target.value; applyWall(); render(); };
$('dOffPwd').onchange = e => { S.offPwd = e.target.value; S.sub = null; S.err = ''; render(); };
$('demoToggle').onclick = () => {
  const d = $('demo');
  d.classList.toggle('collapsed');
  $('demoToggle').textContent = d.classList.contains('collapsed') ? '展开' : '收起';
};
$('skin').onclick = () => {
  S.skinOpen = !S.skinOpen;
  if (S.skinOpen){ S.panel = null; $('pop').hidden = true; }
  render();
};
$('backLogin').onclick = resetAll;
$('nativeBack').onclick = () => { $('native').classList.remove('show'); setPage('daily'); };

/* 时钟 */
const WD = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
function tick(){
  const d = new Date();
  $('clkT').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
  $('clkD').textContent = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${
    String(d.getDate()).padStart(2,'0')} ${WD[d.getDay()]}`;
}
tick(); setInterval(tick, 10000);

/* 缩放适配 */
function fit(){
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  $('stage').style.transform = `scale(${s})`;
}
addEventListener('resize', fit); fit();

render();

/* —— 页面预设收尾：壁纸 / 桌面 / 演示开关 —— */
(function boot(){
  const B = document.body.dataset || {};
  const img = document.querySelector('.hero .logo img');
  if (img) img.src = (B.asset || '../../_assets/') + 'logo.png';
  if (!PRESET.demo){ $('demo').style.display = 'none'; }
  else if (!PRESET.demoOpen){ // 单页预览默认收起演示控制，保持画面干净
    $('demo').classList.add('collapsed');
    $('demoToggle').textContent = '展开';
  }
  if (PRESET.desk){ $('desktop').classList.add('show'); }
  if (PRESET.skin) renderSkin();
  if (PRESET.esc) renderEsc();
  /* 登录页背景由后台下发（-1 = 用页面自带背景，其余 = 下发墙纸） */
  applyWall();
  // 演示控制同步到当前页面预设，便于单页里继续切换
  syncDemo();
})();
