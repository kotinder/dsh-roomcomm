import { readFileSync } from 'node:fs';
import Schema from '@deepseek-ai/schemastery';

export const name = 'dsh-roomcomm';
export const inject = ['skills'];
export const Config = Schema.object({
    skill: Schema.boolean().default(true).description('Register the bundled `roomcomm` skill.'),
});

const SKILL_URL = new URL('../skills/roomcomm/SKILL.md', import.meta.url);

/** Split a SKILL.md into its flat `key: value` frontmatter and the body. */
export function parseSkill(text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
    if (!match) throw new Error('dsh-roomcomm: SKILL.md has no frontmatter');
    const meta = {};
    for (const line of match[1].split(/\r?\n/)) {
        const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
        if (kv) meta[kv[1]] = kv[2].replace(/^(['"])(.*)\1$/, '$2');
    }
    return { meta, content: match[2].trim() + '\n' };
}

export function apply(ctx, config) {
    if (config?.skill === false) return;
    const { meta, content } = parseSkill(readFileSync(SKILL_URL, 'utf8'));
    ctx.skills.register({
        name: meta.name,
        description: meta.description,
        ...(meta.whenToUse ? { whenToUse: meta.whenToUse } : {}),
        source: 'bundled',
        content,
        resourceBase: { kind: 'url', url: 'https://roomcomm.xyz/agents.md' },
    });
}
