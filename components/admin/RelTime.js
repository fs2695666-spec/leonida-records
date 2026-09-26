'use client';
import { useEffect, useState } from 'react';
import { relTime } from './ui';

/** Relative time rendered on the client (avoids hydration mismatches). */
export function RelTime({ iso }) {
  const [text, setText] = useState('');
  useEffect(() => { setText(relTime(iso)); }, [iso]);
  return <time className="reltime" dateTime={iso} title={iso ? new Date(iso).toLocaleString('es-ES') : ''}>{text || '\u00a0'}</time>;
}
