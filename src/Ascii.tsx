import { computed, defineComponent, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

export default defineComponent(() => {
  const refInput = useTemplateRef<HTMLInputElement>('refInput');

  onMounted(() => {
    refInput.value?.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    refInput.value?.removeEventListener('keydown', handleKeydown);
  });

  const outputAscii = ref(0);
  const outputKeys = ref('');
  const outputModifyOtherKeysInput = ref('');
  const outputCsiuInput = ref('');
  const outputKeybinding = ref('');

  function handleKeydown(e: KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const key = e.key === 'Unidentified' ? e.code : e.key;

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      return '';
    }

    outputAscii.value = ascii({ key });

    const ctrl = e.ctrlKey;
    const alt = e.altKey;
    const shift = e.shiftKey;
    outputKeys.value = keys({
      key,
      ctrl,
      alt,
      shift,
    });

    const modifier = calcModifier({
      ctrl,
      alt,
      shift,
    });

    const functionKey = functionKeyInput({
      key,
      modifier,
    });

    if (functionKey) {
      outputModifyOtherKeysInput.value = functionKey;
      outputCsiuInput.value = functionKey;
    } else {
      outputModifyOtherKeysInput.value = modifyOtherKeysInput({
        key,
        modifier,
        ascii: outputAscii.value,
      });
      outputCsiuInput.value = csiuInput({
        key,
        modifier,
      });
    }

    outputKeybinding.value = keybinding({
      keys: outputKeys.value,
      input: key.length === 1 ? outputModifyOtherKeysInput.value : outputCsiuInput.value,
    });
  }

  return () => (
    <div class="flex min-h-screen flex-col gap-8 bg-zinc-950 p-8 font-mono text-zinc-100">
      <div class="mx-auto flex min-w-2xl flex-col gap-4">
        {/* Title */}
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Key Mapper</h1>
        </div>

        {/* Input */}
        <div class="space-y-2">
          <label class="text-sm text-zinc-400">Press Key</label>
          <input
            ref="refInput"
            type="text"
            value={outputKeys.value}
            class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Info Grid */}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard title="ASCII" value={outputAscii.value || ''} />

          <InfoCard title="CSI u" value={outputCsiuInput.value} />

          <InfoCard title="xterm Input" value={outputModifyOtherKeysInput.value} />
        </div>

        {/* JSON Output */}
        <div class="space-y-2">
          <div class="text-sm text-zinc-400">Windows Terminal Keybinding</div>
          <pre class="h-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
            {outputKeybinding.value || ''}
          </pre>
        </div>
      </div>

      <AllKeyCombination />
    </div>
  );
});

function InfoCard(props: { title: string; value: number | string }) {
  return (
    <div class="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div class="text-xs tracking-wide text-zinc-500 uppercase">{props.title}</div>
      <div class="text-lg break-all">{props.value || '—'}</div>
    </div>
  );
}

function ascii({ key }: { key: string }) {
  if (key.length === 1) {
    return key.charCodeAt(0);
  }

  switch (key) {
    case 'Tab':
      return 9;

    case 'Enter':
      return 13;

    case 'Escape':
      return 27;

    case 'Backspace':
      // BS（後退） => 8 => h になるので DEL（削除）
      return 127;

    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowRight':
    case 'ArrowLeft':

    case 'Home':
    case 'End':
    case 'Insert':
    case 'Delete':
    case 'PageUp':
    case 'PageDown':

    case 'F1':
    case 'F2':
    case 'F3':
    case 'F4':
    case 'F5':
    case 'F6':
    case 'F7':
    case 'F8':
    case 'F9':
    case 'F10':
    case 'F11':
    case 'F12':
    default:
      return 0;
  }
}

function keys(params: { key: string; ctrl: boolean; alt: boolean; shift: boolean }) {
  const keys: string[] = [];

  if (params.ctrl) {
    keys.push('ctrl');
  }
  if (params.alt) {
    keys.push('alt');
  }
  if (params.shift) {
    keys.push('shift');
  }

  const key = (() => {
    switch (params.key) {
      case ' ':
        return 'space';
      case '+':
        return 'plus';
      case 'ArrowUp':
        return 'up';
      case 'ArrowDown':
        return 'down';
      case 'ArrowRight':
        return 'right';
      case 'ArrowLeft':
        return 'left';
      default:
        return params.key.toLowerCase();
    }
  })();
  keys.push(key);

  return keys.join('+');
}

function calcModifier(params: { ctrl: boolean; alt: boolean; shift: boolean }) {
  let modifier = 1;
  if (params.shift) modifier += 1;
  if (params.alt) modifier += 2;
  if (params.ctrl) modifier += 4;

  return modifier;
}

const ESC = '\\u001b';

function functionKeyInput(params: { key: string; modifier: number }) {
  // ===== Arrow =====
  const arrowMap: Record<string, string> = {
    ArrowUp: 'A',
    ArrowDown: 'B',
    ArrowRight: 'C',
    ArrowLeft: 'D',
  };

  if (arrowMap[params.key]) {
    if (params.modifier === 1) {
      return `${ESC}[${arrowMap[params.key]}`;
    }
    return `${ESC}[1;${params.modifier}${arrowMap[params.key]}`;
  }

  // ===== Home / End =====
  if (params.key === 'Home') {
    if (params.modifier === 1) return `${ESC}[H`;
    return `${ESC}[1;${params.modifier}H`;
  }

  if (params.key === 'End') {
    if (params.modifier === 1) return `${ESC}[F`;
    return `${ESC}[1;${params.modifier}F`;
  }

  // ===== F1-F4 =====
  const f1to4: Record<string, string> = {
    F1: 'P',
    F2: 'Q',
    F3: 'R',
    F4: 'S',
  };

  if (f1to4[params.key]) {
    if (params.modifier === 1) {
      return `${ESC}O${f1to4[params.key]}`;
    }
    return `${ESC}[1;${params.modifier}${f1to4[params.key]}`;
  }

  // ===== F5-F12 =====
  const f5to12: Record<string, string> = {
    F5: '15',
    F6: '17',
    F7: '18',
    F8: '19',
    F9: '20',
    F10: '21',
    F11: '23',
    F12: '24',
  };

  if (f5to12[params.key]) {
    if (params.modifier === 1) {
      return `${ESC}[${f5to12[params.key]}~`;
    }
    return `${ESC}[${f5to12[params.key]};${params.modifier}~`;
  }

  // ===== Insert / Delete / Page =====
  const editMap: Record<string, string> = {
    Insert: '2',
    Delete: '3',
    PageUp: '5',
    PageDown: '6',
  };

  if (editMap[params.key]) {
    if (params.modifier === 1) {
      return `${ESC}[${editMap[params.key]}~`;
    }
    return `${ESC}[${editMap[params.key]};${params.modifier}~`;
  }

  return '';
}

function modifyOtherKeysInput(params: { key: string; modifier: number; ascii: number }) {
  // ===== modifyOtherKeys =====
  if (params.modifier >= 2 && params.ascii) {
    return `${ESC}[27;${params.modifier};${params.ascii}~`;
  }

  // ===== 通常文字 =====
  return params.key;
}

function csiuInput(params: { key: string; modifier: number }) {
  // ===== CSI u =====
  // ===== 文字キーのみ =====
  if (params.key.length === 1) {
    const code = params.key.codePointAt(0);

    if (params.modifier >= 2 && code) {
      return `${ESC}[${code};${params.modifier}u`;
    } else {
      return params.key;
    }
  }

  // ===== 特殊キー =====
  switch (params.key) {
    case 'Tab':
      if (params.modifier === 1) return '\t';
      return `${ESC}[9;${params.modifier}u`;

    case 'Enter':
      if (params.modifier === 1) return '\r';
      return `${ESC}[13;${params.modifier}u`;

    case 'Escape':
      if (params.modifier === 1) return '\u001b';
      return `${ESC}[27;${params.modifier}u`;

    case 'Backspace':
      if (params.modifier === 1) return '\x7f';
      return `${ESC}[127;${params.modifier}u`;

    default:
      return '';
  }
}

function keybinding(params: { keys: string; input: string }) {
  return JSON.stringify(
    {
      command: {
        action: 'sendInput',
        input: params.input.replace('\\u001b', '\u001b'),
      },
      id: `User.sendInput.${params.keys.toUpperCase().replace(/\+/g, '_')}`,
      keys: params.keys,
    },
    null,
    2,
  );
}

type KeyComboResult = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  modifier: number;
  ascii: number;
  keys: string;
  csiuInput: string;
  modifyOtherKeysInput: string;
  keybinding: string;
};

function AllKeyCombination() {
  const results: KeyComboResult[] = [];

  const keyList = [
    // 文字
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    ...'0123456789'.split(''),
    ...'!"#$%&\'()*+,-./'.split(''),
    ...':;<=>?@[\\]^_`{|}~'.split(''),

    // 特殊
    'Tab',
    'Enter',
    'Escape',
    'Backspace',

    'ArrowUp',
    'ArrowDown',
    'ArrowRight',
    'ArrowLeft',

    'Home',
    'End',
    'Insert',
    'Delete',
    'PageUp',
    'PageDown',

    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
  ];

  const modifierCombos = [
    { ctrl: false /*   */, alt: false /*   */, shift: false /*   */ },
    { ctrl: false /*   */, alt: false /*   */, shift: true /*    */ },
    { ctrl: false /*   */, alt: true /*    */, shift: false /*   */ },
    { ctrl: false /*   */, alt: true /*    */, shift: true /*    */ },
    { ctrl: true /*    */, alt: false /*   */, shift: false /*   */ },
    { ctrl: true /*    */, alt: false /*   */, shift: true /*    */ },
    { ctrl: true /*    */, alt: true /*    */, shift: false /*   */ },
    { ctrl: true /*    */, alt: true /*    */, shift: true /*    */ },
  ];

  for (const key of keyList) {
    for (const { ctrl, alt, shift } of modifierCombos) {
      const outputAscii = ascii({ key });

      const outputKeys = keys({
        key,
        ctrl,
        alt,
        shift,
      });

      const modifier = calcModifier({
        ctrl,
        alt,
        shift,
      });

      const functionKey = functionKeyInput({
        key,
        modifier,
      });

      const { outputModifyOtherKeysInput, outputCsiuInput } = {
        outputModifyOtherKeysInput:
          functionKey ||
          modifyOtherKeysInput({
            key,
            modifier,
            ascii: outputAscii,
          }),
        outputCsiuInput:
          functionKey ||
          csiuInput({
            key,
            modifier,
          }),
      };

      const outputKeybinding = keybinding({
        keys: outputKeys,
        input: key.length === 1 ? outputModifyOtherKeysInput : outputCsiuInput,
      });

      results.push({
        key,
        ctrl,
        alt,
        shift,
        modifier,
        ascii: outputAscii,
        keys: outputKeys,
        csiuInput: outputCsiuInput,
        modifyOtherKeysInput: outputModifyOtherKeysInput,
        keybinding: outputKeybinding,
      });
    }
  }

  return (
    <div class="mx-auto min-w-2xl">
      {/* ===== Generate All Section ===== */}

      <div class="overflow-auto rounded-xl border border-zinc-800 bg-zinc-900">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-zinc-900">
            <tr class="border-b border-zinc-800 text-left text-zinc-500">
              <th class="px-4 py-2">Key</th>
              <th class="px-4 py-2">CSI u</th>
              <th class="px-4 py-2">xterm Input</th>
              <th class="px-4 py-2">keybinding</th>
            </tr>
          </thead>

          <tbody>
            {results.map((row) => (
              <tr class="border-b border-zinc-800 hover:bg-zinc-800/40">
                <td class="px-4 py-2 break-all text-blue-400">{row.keys || '—'}</td>
                <td class="px-4 py-2 break-all text-green-400">{row.csiuInput || '—'}</td>
                <td class="px-4 py-2 break-all text-purple-400">
                  {row.modifyOtherKeysInput || '—'}
                </td>
                <td class="text-white-400 px-2 py-2 break-all">
                  <pre>{row.keybinding || '—'}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
