import { diffLines, diffArrays } from 'diff';

const TAG_RE = /^<[^>]+>$/;
const WHITESPACE_RE = /^\s+$/;

const tokenize = (str) => str.match(/(<[^>]+>|\s+|[^\s<]+)/g) || [];

function buildStreams(wordDiff) {
  const origStream = [];
  const buffStream = [];

  const push = (stream, tokens, isDiff) => {
    for (const token of tokens) stream.push({ token, diff: isDiff });
  };

  for (const part of wordDiff) {
    if (part.removed) {
      push(origStream, part.value, true);
    } else if (part.added) {
      push(buffStream, part.value, true);
    } else {
      push(origStream, part.value, false);
      push(buffStream, part.value, false);
    }
  }

  return { origStream, buffStream };
}

function bridgesToNextDiff(stream, fromIndex) {
  let i = fromIndex;
  while (i < stream.length && WHITESPACE_RE.test(stream[i].token)) i++;
  const next = stream[i];
  return next && next.diff && !TAG_RE.test(next.token);
}

function renderStream(stream, className) {
  let html = '';
  let buffer = '';

  const flush = () => {
    if (buffer) {
      html += `<d-item class="${className}">${buffer}</d-item>`;
      buffer = '';
    }
  };

  stream.forEach(({ token, diff: isDiff }, i) => {
    const isTag = TAG_RE.test(token);
    const isBridgingWhitespace =
      !isDiff && !isTag && buffer && WHITESPACE_RE.test(token) && bridgesToNextDiff(stream, i + 1);

    if (isTag) {
      flush();
      html += token;
    } else if (isDiff || isBridgingWhitespace) {
      buffer += token;
    } else {
      flush();
      html += token;
    }
  });
  flush();

  return html;
}

export function diffDescription(original, buffed) {
  console.log(original);
  console.log(buffed);
  const lineDiff = diffLines(original, buffed);
  const origStream = [];
  const buffStream = [];

  const push = (stream, tokens, isDiff) => {
    for (const token of tokens) stream.push({ token, diff: isDiff });
  };

  for (let i = 0; i < lineDiff.length; i++) {
    const cur = lineDiff[i];
    const next = lineDiff[i + 1];

    if (cur.removed && next?.added) {
      const wordDiff = diffArrays(tokenize(cur.value), tokenize(next.value));
      const streams = buildStreams(wordDiff);
      origStream.push(...streams.origStream);
      buffStream.push(...streams.buffStream);
      i++;
    } else if (cur.removed) {
      push(origStream, tokenize(cur.value), true);
    } else if (cur.added) {
      push(buffStream, tokenize(cur.value), true);
    } else {
      const tokens = tokenize(cur.value);
      push(origStream, tokens, false);
      push(buffStream, tokens, false);
    }
  }

  console.log({ origStream, buffStream });

  return {
    original: renderStream(origStream, 'bg-red-900/80'),
    buffed: renderStream(buffStream, 'bg-green-900/80'),
  };
}
