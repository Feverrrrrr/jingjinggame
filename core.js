/*
 * 《深海旅馆：13 楼没有客人》 headless core.
 * UMD: browser attaches window.Hotel13Core; Node require() gets the same.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Hotel13Core = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RULES = {
    no13: '本店没有 13 楼。看到 13F 按钮亮，盖住它。',
    shadow: '没有影子的客人，不开门。',
    one: '电梯里只能有一位客人。',
    look: '客人说“我到了”时，不要看它的脸，先关门。',
    time: '凌晨 3:13，不要按任何按钮。',
    card: '房卡和客人报的楼层不一致时，以房卡为准。',
    answer: '13 楼有人叫你，不要回答。',
  };

  const NIGHTS = [
    {
      id: 1,
      title: '第一夜 · 看门',
      intro: '晚上 11:40。第一晚值班，规则只有两条。',
      rules: ['no13', 'shadow'],
      events: [
        {
          id: '1-1', floor: '3F', guest: '戴帽子的先生', shadow: true,
          line: '我到 3 楼，麻烦开一下。',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '门开了。先生有影子，电梯里多了一点暖意。' },
            { id: 'refuse', label: '不开门', order: -12, reply: '你把人关在门外。他敲了很久，最后没有声音了。' },
            { id: 'cover', label: '盖住 13F', order: -6, reply: '你紧张地盖住 13F。先生看了看你，走了。' },
          ],
          correct: 'open',
        },
        {
          id: '1-2', floor: '7F', guest: '没有影子的老太太', shadow: false,
          line: '我住 7 楼。小伙子，开开门。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。电梯里没有她的影子，只有一股潮水味。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。她隔着门说：真没礼貌。然后电梯轻了一点。' },
            { id: 'cover', label: '盖住 13F', order: -4, reply: '你盖住 13F。老太太笑了：你盖错地方了。' },
          ],
          correct: 'refuse',
        },
        {
          id: '1-3', floor: '13F', guest: '没有客人', shadow: false,
          line: '13F 按钮自己亮了。电梯里没有别人。',
          choices: [
            { id: 'cover', label: '盖住 13F', order: 6, truth: 1, reply: '你用毛巾盖住按钮。灯灭了，但毛巾下面还在亮。' },
            { id: 'press13', label: '按 13F', order: -16, reply: '按钮很冷。门开了，外面是和你身后一模一样的电梯。' },
            { id: 'refuse', label: '什么都不做', order: -6, reply: '你看着按钮亮了很久。它好像也在看你。' },
          ],
          correct: 'cover',
        },
        {
          id: '1-4', floor: '5F', guest: '抱鱼缸的女孩', shadow: true,
          line: '5 楼。鱼缸有点重，能帮我按一下吗？',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '门开了。鱼缸里的鱼吐了个泡，像在说谢谢。' },
            { id: 'refuse', label: '不开门', order: -10, reply: '女孩抱着鱼缸走了。电梯里留下一点咸味。' },
            { id: 'cover', label: '盖住 13F', order: -4, reply: '你盖住 13F。女孩问：这里不是没有 13 楼吗？' },
          ],
          correct: 'open',
        },
        {
          id: '1-5', floor: '9F', guest: '没有影子的小孩', shadow: false,
          line: '9 楼。妈妈让我自己上来。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。小孩没有影子，脚也没有碰到地。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。小孩在门外站了一会儿，说：那我走楼梯。' },
            { id: 'cover', label: '盖住 13F', order: -4, reply: '你盖住 13F。小孩笑了：你怕的不是我。' },
          ],
          correct: 'refuse',
        },
      ],
    },
    {
      id: 2,
      title: '第二夜 · 一位客人',
      intro: '第二晚。今晚开始，电梯里只能有一位客人。',
      rules: ['no13', 'shadow', 'one'],
      events: [
        {
          id: '2-1', floor: '6F', guest: '抱伞的女士', shadow: true,
          line: '6 楼。电梯是空的吧？',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '电梯是空的。她收伞进来，伞尖滴着海水。' },
            { id: 'refuse', label: '不开门', order: -10, reply: '她看了看空电梯，走了。你听见伞尖一路滴水。' },
          ],
          correct: 'open',
        },
        {
          id: '2-2', floor: '8F', guest: '第二位客人', shadow: true,
          line: '8 楼。让我进去，我赶时间。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '电梯里已经有一个人。门开后，两个人都没有再看你。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。电梯里的客人轻轻说：做得对。' },
            { id: 'cover', label: '盖住 13F', order: -5, reply: '你盖住 13F。第二位客人说：你连我在哪层都不知道。' },
          ],
          correct: 'refuse',
        },
        {
          id: '2-3', floor: '13F', guest: '没有客人', shadow: false,
          line: '13F 又亮了。这次按钮上有一道水痕。',
          choices: [
            { id: 'cover', label: '盖住 13F', order: 6, truth: 1, reply: '毛巾湿了。灯灭了，水痕却还在往上爬。' },
            { id: 'press13', label: '按 13F', order: -16, reply: '门开了一条缝。里面有人说：你终于按了。' },
            { id: 'refuse', label: '假装没看见', order: -6, reply: '你移开视线。按钮亮得更久了。' },
          ],
          correct: 'cover',
        },
        {
          id: '2-4', floor: '4F', guest: '没有影子的男人', shadow: false,
          line: '4 楼。别看了，开门。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。他没有影子，西装下摆正在往下滴水。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。他说：你会后悔的。电梯门关上了。' },
          ],
          correct: 'refuse',
        },
        {
          id: '2-5', floor: '10F', guest: '捂着脸的客人', shadow: true,
          line: '我到了。别看我。',
          choices: [
            { id: 'close', label: '先关门，不看它的脸', order: 6, reply: '你关上门，盯着楼层灯。身后有很轻的呼吸声。' },
            { id: 'open', label: '回头看它', order: -14, reply: '你回头了。它捂着脸的手指缝里，也有一双眼睛。' },
            { id: 'cover', label: '盖住 13F', order: -4, reply: '你盖住 13F。它说：来不及了。' },
          ],
          correct: 'close',
        },
      ],
    },
    {
      id: 3,
      title: '第三夜 · 3:13',
      intro: '第三晚。凌晨 3:13，电梯会自己停一次。',
      rules: ['no13', 'one', 'time'],
      events: [
        {
          id: '3-1', floor: '12F', guest: '没有客人', shadow: false,
          line: '3:13。12F 按钮亮了。电梯没有动。',
          choices: [
            { id: 'wait', label: '等 3:13 过去', order: 6, reply: '你数到 3:14。按钮灭了，像什么都没发生。' },
            { id: 'press12', label: '按 12F', order: -12, reply: '门开了。12 楼走廊的尽头，站着一个和你一样的人。' },
            { id: 'cover', label: '盖住 13F', order: -4, reply: '你盖住 13F。时间没有过去，反而更慢了。' },
          ],
          correct: 'wait',
        },
        {
          id: '3-2', floor: '2F', guest: '抱枕头的老先生', shadow: true,
          line: '2 楼。我忘带钥匙了。',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '门开了。他抱着枕头，像个放学回家的小孩。' },
            { id: 'refuse', label: '不开门', order: -10, reply: '你没有开门。他把枕头抱得更紧了。' },
          ],
          correct: 'open',
        },
        {
          id: '3-3', floor: '13F', guest: '没有客人', shadow: false,
          line: '13F 按钮亮了。这次，楼层灯显示的是 3:13。',
          choices: [
            { id: 'cover', label: '盖住 13F', order: 6, truth: 1, reply: '你盖住按钮。楼层灯闪了一下，变回 13F，又灭了。' },
            { id: 'press13', label: '按 13F', order: -16, reply: '门开了。外面是第三晚的电梯，里面坐着第三晚的你。' },
            { id: 'wait', label: '等 3:13 过去', order: -4, reply: '你等到 3:14。按钮还在亮。' },
          ],
          correct: 'cover',
        },
        {
          id: '3-4', floor: '11F', guest: '没有影子的女人', shadow: false,
          line: '11 楼。你看见我的影子了吗？',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。她低头看了看地面，笑了：原来在你脚下。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。她说：真可惜。然后从门缝里渗走了。' },
          ],
          correct: 'refuse',
        },
        {
          id: '3-5', floor: '1F', guest: '没有影子的客人', shadow: false,
          line: '3:13。1 楼有人要上来。',
          choices: [
            { id: 'wait', label: '等 3:13 过去', order: 6, reply: '你等到 3:14。1 楼没有人了，只剩一只按在按钮上的手印。' },
            { id: 'press1', label: '按 1F', order: -12, reply: '门开了。1 楼大厅里，站着今晚所有没有影子的客人。' },
          ],
          correct: 'wait',
        },
      ],
    },
    {
      id: 4,
      title: '第四夜 · 房卡',
      intro: '第四晚。今晚的客人，说的楼层不一定是真的。',
      rules: ['no13', 'shadow', 'card'],
      events: [
        {
          id: '4-1', floor: '6F / 9F', guest: '拿错房卡的先生', shadow: true,
          line: '我去 6 楼。房卡上写着 9F，肯定是前台写错了。',
          choices: [
            { id: 'press6', label: '按 6F', order: -12, reply: '6 楼到了。他走出去，又回头问：这是几楼？' },
            { id: 'press9', label: '按 9F', order: 6, reply: '9 楼到了。他看了看房卡，说：对，是这。' },
            { id: 'refuse', label: '不开门', order: -6, reply: '他举着房卡站在门外。房卡上的 9F 慢慢变成了 6F。' },
          ],
          correct: 'press9',
        },
        {
          id: '4-2', floor: '13F', guest: '没有客人', shadow: false,
          line: '13F 按钮亮了。电梯里多了一张房卡。',
          choices: [
            { id: 'cover', label: '盖住 13F', order: 6, reply: '你盖住按钮。房卡上写着：1304。' },
            { id: 'press13', label: '按 13F', order: -16, reply: '门开了。1304 的房门也开着，里面传来电梯到站的声音。' },
            { id: 'take', label: '捡起房卡', order: -4, reply: '房卡很冷。背面写着：你已经在 13 楼了。' },
          ],
          correct: 'cover',
        },
        {
          id: '4-3', floor: '3F', guest: '穿雨衣的客人', shadow: true,
          line: '3 楼。外面还在下雨吗？',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '门开了。雨衣在滴水，但电梯里没有下雨。' },
            { id: 'refuse', label: '不开门', order: -10, reply: '你没有开门。雨衣下面的人说：那我等下一趟。' },
          ],
          correct: 'open',
        },
        {
          id: '4-4', floor: '9F', guest: '没有影子的服务生', shadow: false,
          line: '9 楼。客房服务。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。服务生没有影子，餐车上摆着今晚所有客人的房卡。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。服务生说：您的客房服务已签收。' },
          ],
          correct: 'refuse',
        },
        {
          id: '4-5', floor: '13F', guest: '拿 13F 房卡的客人', shadow: true,
          line: '我住 13 楼。房卡给你看。',
          choices: [
            { id: 'cover', label: '盖住 13F，拒载', order: 6, truth: 1, reply: '你盖住 13F，没有开门。房卡在门缝里被抽走了。' },
            { id: 'press13', label: '按 13F', order: -16, reply: '门开了。他走进 13 楼，回头对你笑：你不也是住这吗？' },
            { id: 'open', label: '开门，让他进电梯', order: -8, reply: '他进了电梯。电梯里多了一个人，却没有多一个影子。' },
          ],
          correct: 'cover',
        },
      ],
    },
    {
      id: 5,
      title: '第五夜 · 不要回答',
      intro: '第五晚。13 楼开始叫你的名字。',
      rules: ['no13', 'card', 'answer'],
      events: [
        {
          id: '5-1', floor: '13F', guest: '门外的声音', shadow: false,
          line: '鲸鲸。鲸鲸，你在里面吗？',
          choices: [
            { id: 'answer', label: '回答“在”', order: -18, reply: '你回答了。电梯里的灯全灭了，只剩 13F 的按钮亮着。' },
            { id: 'ignore', label: '不回答', order: 6, reply: '你没有说话。门外的声音又叫了两声，走了。' },
            { id: 'cover', label: '盖住 13F', order: 2, reply: '你盖住 13F。毛巾下面传来一声很轻的“在”。' },
          ],
          correct: 'ignore',
        },
        {
          id: '5-2', floor: '4F', guest: '抱被子的女孩', shadow: true,
          line: '4 楼。我妈妈让我上来拿东西。',
          choices: [
            { id: 'open', label: '开门', order: 6, reply: '门开了。她抱着被子，脚边有小小的影子。' },
            { id: 'refuse', label: '不开门', order: -10, reply: '你没有开门。她把被子往上拉了拉，遮住脸。' },
          ],
          correct: 'open',
        },
        {
          id: '5-3', floor: '13F', guest: '门外的声音', shadow: false,
          line: '鲸鲸。你不是一直想知道 13 楼有什么吗？',
          choices: [
            { id: 'answer', label: '回答“想”', order: -18, reply: '你回答了。电梯门开了一条缝，外面是旅馆的大堂，前台站着另一个你。' },
            { id: 'ignore', label: '不回答', order: 6, reply: '你没有回答。声音叹了口气：那你自己上来看。' },
          ],
          correct: 'ignore',
        },
        {
          id: '5-4', floor: '8F', guest: '没有影子的客人', shadow: false,
          line: '8 楼。最后一趟了，开门吧。',
          choices: [
            { id: 'open', label: '开门', order: -12, reply: '门开了。它没有影子，也没有脸。电梯开始往下沉。' },
            { id: 'refuse', label: '不开门', order: 6, reply: '你没有开门。它说：那就到这里吧。电梯停了。' },
          ],
          correct: 'refuse',
        },
        {
          id: '5-5', floor: '13F', guest: '13 楼的门', shadow: false,
          line: '13F 的门开了。里面没有客人，只有一张值班表。',
          choices: [
            { id: 'close', label: '关上门', order: 6, truth: 1, reply: '你关上门。值班表上，今晚的名字慢慢消失了。' },
            { id: 'enter', label: '走进去', order: -20, reply: '你走进 13 楼。身后电梯门关上，楼层显示：14F。' },
            { id: 'answer', label: '问“有人吗”', order: -16, reply: '里面有人回答：有。是你。' },
          ],
          correct: 'close',
        },
      ],
    },
  ];

  function getEvent(game) {
    const n = NIGHTS[game.night];
    return n ? n.events[game.stop] : null;
  }

  function activeRules(game) {
    const n = NIGHTS[game.night];
    return n ? n.rules.map(id => ({ id, text: RULES[id] })) : [];
  }

  function ending(game) {
    if (game.order <= 0) {
      return {
        key: 'bad', title: '坏结局 · 你被留在了夜班',
        text: '电梯停在了没有数字的楼层。第二天的值班表上，夜班一栏写着你的名字，一直写到很多年以后。',
      };
    }
    if (game.truth >= 5 && game.order >= 65) {
      return {
        key: 'hidden', title: '隐藏结局 · 你才是 13 楼的客人',
        text: '你关掉电梯，走到 13F 的按钮前。按钮里映出的不是你的脸。你终于想起，自己已经在这家旅馆住了很久。',
      };
    }
    if (game.order >= 65 && game.truth >= 4) {
      return {
        key: 'good', title: '好结局 · 13 楼没有客人',
        text: '天亮了。你把毛巾从 13F 按钮上拿下来，按钮已经不见了。旅馆的客人名单上，今晚没有 13 楼。',
      };
    }
    return {
      key: 'normal', title: '普通结局 · 天亮了，但 13 楼还在',
      text: '你撑到了天亮。电梯门打开，外面是正常的旅馆大堂。只是楼层显示器上，13F 的灯还亮着。',
    };
  }

  function createGame(seed) {
    return {
      seed: seed || 1,
      mode: 'title',
      phase: 'night',
      night: 0,
      stop: 0,
      order: 50,
      truth: 0,
      history: [],
      last: null,
      startedAt: 0,
    };
  }

  function start(game) {
    game.mode = 'playing';
    game.phase = 'night';
    game.night = 0;
    game.stop = 0;
    game.order = 50;
    game.truth = 0;
    game.history = [];
    game.last = null;
    return game;
  }

  function beginNight(game) {
    if (game.phase !== 'night') return game;
    game.phase = 'event';
    return game;
  }

  function choose(game, choiceId) {
    if (game.phase !== 'event') return { ok: false, reason: 'not event' };
    const ev = getEvent(game);
    const choice = ev.choices.find(c => c.id === choiceId);
    if (!choice) return { ok: false, reason: 'bad choice' };
    game.order = Math.max(0, Math.min(100, game.order + (choice.order || 0)));
    game.truth += choice.truth || 0;
    game.last = {
      eventId: ev.id, choiceId: choice.id, correct: choice.id === ev.correct,
      order: game.order, truth: game.truth, reply: choice.reply,
    };
    game.history.push({ ...game.last, night: game.night + 1, floor: ev.floor });
    game.phase = 'feedback';
    if (game.order <= 0) {
      game.mode = 'ending';
      game.phase = 'ending';
    }
    return { ok: true, ...game.last };
  }

  function next(game) {
    if (game.phase === 'night') return beginNight(game);
    if (game.phase !== 'feedback') return game;
    if (game.mode === 'ending') return game;
    const n = NIGHTS[game.night];
    if (game.stop < n.events.length - 1) {
      game.stop++;
      game.phase = 'event';
    } else if (game.night < NIGHTS.length - 1) {
      game.night++;
      game.stop = 0;
      game.phase = 'night';
    } else {
      game.mode = 'ending';
      game.phase = 'ending';
    }
    return game;
  }

  function snapshot(game) {
    const ev = getEvent(game);
    return {
      mode: game.mode, phase: game.phase, night: game.night + 1,
      nightTitle: NIGHTS[game.night].title, nightIntro: NIGHTS[game.night].intro,
      stop: game.stop + 1, stops: NIGHTS[game.night].events.length,
      order: game.order, truth: game.truth,
      rules: activeRules(game),
      event: ev ? {
        id: ev.id, floor: ev.floor, guest: ev.guest, line: ev.line,
        shadow: ev.shadow, choices: ev.choices.map(c => ({ id: c.id, label: c.label })),
      } : null,
      last: game.last,
      ending: game.mode === 'ending' ? ending(game) : null,
      history: game.history.slice(),
    };
  }

  return {
    RULES, NIGHTS, createGame, start, beginNight, choose, next, ending, snapshot,
    getCurrentEvent: getEvent,
  };
});
