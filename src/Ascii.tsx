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
  const outputInput = ref('');

  function handleKeydown(e: KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const key = e.key;
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

    outputInput.value = input({
      key,
      ctrl,
      alt,
      shift,
      ascii: outputAscii.value,
    });
  }

  const outputAction = computed(() => {
    return JSON.stringify(
      {
        command: {
          action: 'sendInput',
          input: outputInput.value.replace('\\u001b', '\u001b'),
        },
        id: `User.sendInput.${outputKeys.value.toUpperCase().replace(/\+/g, '_')}`,
      },
      null,
      2,
    );
  });

  return () => (
    <div class="min-h-screen bg-zinc-950 p-8 font-mono text-zinc-100">
      <div class="mx-auto max-w-4xl space-y-8">
        {/* Title */}
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Key Mapper</h1>
          <p class="text-sm text-zinc-400">Windows Terminal / Neovim / xterm 変換ツール</p>
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

          <InfoCard title="Windows Keys" value={outputKeys.value} />

          <InfoCard title="xterm Input" value={outputInput.value} />
        </div>

        {/* JSON Output */}
        {outputInput.value && (
          <div class="space-y-2">
            <div class="text-sm text-zinc-400">Windows Terminal Action</div>
            <pre class="overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
              {outputAction.value}
            </pre>
          </div>
        )}
      </div>
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
    case 'Backspace':
      return 8;

    case 'Tab':
      return 9;

    case 'Enter':
      return 13;

    case 'Escape':
      return 27;

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

  if (['Control', 'Alt', 'Shift'].includes(params.key)) {
    return '';
  }

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

function input(params: {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  ascii: number;
}) {
  let modifier = 1;
  if (params.shift) modifier += 1;
  if (params.alt) modifier += 2;
  if (params.ctrl) modifier += 4;

  const ESC = '\\u001b';

  // ===== Arrow =====
  const arrowMap: Record<string, string> = {
    ArrowUp: 'A',
    ArrowDown: 'B',
    ArrowRight: 'C',
    ArrowLeft: 'D',
  };

  if (arrowMap[params.key]) {
    if (modifier === 1) {
      return `${ESC}[${arrowMap[params.key]}`;
    }
    return `${ESC}[1;${modifier}${arrowMap[params.key]}`;
  }

  // ===== Home / End =====
  if (params.key === 'Home') {
    if (modifier === 1) return `${ESC}[H`;
    return `${ESC}[1;${modifier}H`;
  }

  if (params.key === 'End') {
    if (modifier === 1) return `${ESC}[F`;
    return `${ESC}[1;${modifier}F`;
  }

  // ===== F1-F4 =====
  const f1to4: Record<string, string> = {
    F1: 'P',
    F2: 'Q',
    F3: 'R',
    F4: 'S',
  };

  if (f1to4[params.key]) {
    if (modifier === 1) {
      return `${ESC}O${f1to4[params.key]}`;
    }
    return `${ESC}[1;${modifier}${f1to4[params.key]}`;
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
    if (modifier === 1) {
      return `${ESC}[${f5to12[params.key]}~`;
    }
    return `${ESC}[${f5to12[params.key]};${modifier}~`;
  }

  // ===== Insert / Delete / Page =====
  const editMap: Record<string, string> = {
    Insert: '2',
    Delete: '3',
    PageUp: '5',
    PageDown: '6',
  };

  if (editMap[params.key]) {
    if (modifier === 1) {
      return `${ESC}[${editMap[params.key]}~`;
    }
    return `${ESC}[${editMap[params.key]};${modifier}~`;
  }

  // ===== modifyOtherKeys =====
  if ((params.ctrl || params.alt) && params.ascii) {
    return `${ESC}[27;${modifier};${params.ascii}~`;
  }

  // ===== 通常文字 =====
  return params.key;
}
