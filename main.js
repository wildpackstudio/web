
(function(){
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if(window.scrollY > 40){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var scrim = document.getElementById('navScrim');
  function closeNav(){
    toggle.classList.remove('is-open');
    nav.classList.remove('is-open');
    scrim.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
  }
  function toggleNav(){
    var open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', toggleNav);
  scrim.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeNav);
  });

  var links = document.querySelectorAll('.main-nav a');
  var sections = [];
  links.forEach(function(a){
    var id = a.getAttribute('href');
    var el = id && id.charAt(0) === '#' && id.length > 1 ? document.querySelector(id) : null;
    if(el && document.getElementById('homeView').contains(el)) sections.push({ link:a, el:el });
  });
  var setActive = function(){
    if(document.getElementById('wild-impact').classList.contains('is-active')){ return; }
    if(document.getElementById('wild-lab') && document.getElementById('wild-lab').classList.contains('is-active')){ return; }
    if(document.getElementById('la-manada') && document.getElementById('la-manada').classList.contains('is-active')){ return; }
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function(s){
      if(s.el.offsetTop <= pos) current = s;
    });
    links.forEach(function(a){ a.classList.remove('is-active'); });
    if(current) current.link.classList.add('is-active');
  };
  document.addEventListener('scroll', setActive, { passive:true });
  setActive();

  var videoDesktop = document.getElementById('heroVideoDesktop');
  var videoMobile = document.getElementById('heroVideoMobile');
  var mobileQuery = window.matchMedia('(max-width:760px)');

  function wireVideo(v){
    if(!v) return;
    v.addEventListener('canplay', function(){ v.classList.add('is-ready'); });
    v.addEventListener('error', function(){ v.style.display = 'none'; }, true);
    if(v.readyState >= 3){ v.classList.add('is-ready'); }
  }
  wireVideo(videoDesktop);
  wireVideo(videoMobile);

  function syncActiveVideo(){
    var active = mobileQuery.matches ? videoMobile : videoDesktop;
    var idle = mobileQuery.matches ? videoDesktop : videoMobile;
    if(idle){ idle.pause(); }
    if(active){
      if(active.preload !== 'auto'){ active.preload = 'auto'; active.load(); }
      var p = active.play();
      if(p && p.catch){ p.catch(function(){}); }
    }
  }
  syncActiveVideo();
  if(mobileQuery.addEventListener){ mobileQuery.addEventListener('change', syncActiveVideo); }
  else if(mobileQuery.addListener){ mobileQuery.addListener(syncActiveVideo); }

  /* ---- Utilidad: separar texto en palabras enmascaradas (wave / mask slide) ---- */
  function wrapWordsInMask(container, opts){
    opts = opts || {};
    var step = opts.step || 0.06;
    var dur = opts.duration || 0.72;
    var ease = opts.ease || 'cubic-bezier(0.16,1,0.3,1)';
    var animName = opts.animationName || 'waveWordIn';
    var startDelay = opts.startDelay || 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wordIndex = 0;
    var lastInner = null;

    function wrapWords(text){
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function(chunk){
        if(chunk === ''){ return; }
        if(/^\s+$/.test(chunk)){
          frag.appendChild(document.createTextNode(chunk));
          return;
        }
        if(lastInner && /^[,.;:!?)\]]+$/.test(chunk)){
          lastInner.textContent += chunk;
          return;
        }
        var mask = document.createElement('span');
        mask.className = 'wm';
        var inner = document.createElement('span');
        inner.className = 'wm-inner';
        inner.textContent = chunk;
        if(!reduceMotion){
          inner.style.animation = animName + ' ' + dur + 's ' + ease + ' both';
          inner.style.animationDelay = (startDelay + wordIndex * step).toFixed(3) + 's';
        }
        wordIndex++;
        lastInner = inner;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      return frag;
    }

    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(container.childNodes, function(node){
      if(node.nodeType === 3){
        frag.appendChild(wrapWords(node.textContent));
      } else if(node.nodeType === 1){
        var clone = node.cloneNode(false);
        clone.appendChild(wrapWords(node.textContent || ''));
        frag.appendChild(clone);
      }
    });
    container.innerHTML = '';
    container.appendChild(frag);
    return wordIndex;
  }

  /* ---- Utilidad: separar texto en palabras sueltas, sin mascara (para slides horizontales) ---- */
  function wrapWordsPlain(container, opts){
    opts = opts || {};
    var step = opts.step || 0.08;
    var dur = opts.duration || 0.5;
    var ease = opts.ease || 'cubic-bezier(0.16,1,0.3,1)';
    var animName = opts.animationName || 'wordSlideIn';
    var startDelay = opts.startDelay || 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wordIndex = 0;

    function wrapWords(text){
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function(chunk){
        if(chunk === ''){ return; }
        if(/^\s+$/.test(chunk)){
          frag.appendChild(document.createTextNode(chunk));
          return;
        }
        var span = document.createElement('span');
        span.className = 'wp';
        span.textContent = chunk;
        if(!reduceMotion){
          span.style.animation = animName + ' ' + dur + 's ' + ease + ' both';
          span.style.animationDelay = (startDelay + wordIndex * step).toFixed(3) + 's';
        }
        wordIndex++;
        frag.appendChild(span);
      });
      return frag;
    }

    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(container.childNodes, function(node){
      if(node.nodeType === 3){
        frag.appendChild(wrapWords(node.textContent));
      } else if(node.nodeType === 1){
        if(node.tagName === 'BR'){ frag.appendChild(node.cloneNode(false)); return; }
        var clone = node.cloneNode(false);
        clone.appendChild(wrapWords(node.textContent || ''));
        frag.appendChild(clone);
      }
    });
    container.innerHTML = '';
    container.appendChild(frag);
    return wordIndex;
  }

  /* ---- Utilidad: revelado por palabras que se puede repetir al entrar/salir del viewport ---- */
  function makeWordReveal(el, opts){
    opts = opts || {};
    var originalHTML = el.innerHTML;
    var isRevealed = false;
    var step = opts.step || 0.14;
    var dur = opts.duration || 1.5;
    var wrapFn = opts.wrapFn || wrapWordsInMask;
    var animName = opts.animationName || 'waveWordIn';

    function show(startDelay){
      if(isRevealed) return;
      isRevealed = true;
      var wordCount = wrapFn(el, { step:step, duration:dur, animationName:animName, startDelay:startDelay || 0 });
      el.style.visibility = 'visible';
      if(opts.onShow){ opts.onShow(wordCount); }
    }

    function hide(){
      if(!isRevealed) return;
      isRevealed = false;
      el.innerHTML = originalHTML;
      el.style.visibility = 'hidden';
      if(opts.onHide){ opts.onHide(); }
    }

    return { show:show, hide:hide };
  }

  /* ---- Utilidad: conecta un IntersectionObserver a un controlador show()/hide() ---- */
  /* Registro global de todos los IntersectionObserver creados por
     observeReveal(), para poder forzar un re-chequeo (unobserve+observe)
     cuando el router cambia de vista - ver refreshViewLayout(). */
  var allRevealObservers = [];
  function observeReveal(target, controller, opts){
    opts = opts || {};
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ controller.show(); }
          else{ controller.hide(); }
        });
      }, { threshold: opts.threshold != null ? opts.threshold : 0.4, rootMargin: opts.rootMargin || '0px 0px -15% 0px' });
      io.observe(target);
      allRevealObservers.push({ io: io, target: target });
    } else {
      controller.show();
    }
  }
  function reobserveAllReveals(){
    allRevealObservers.forEach(function(entry){
      entry.io.unobserve(entry.target);
      entry.io.observe(entry.target);
    });
  }
  /* Se llama al final de cada show*() del router: fuerza un reflow
     sincrónico, re-observa todos los IntersectionObserver de reveal
     (para que detecten la posición real de la vista recién mostrada,
     en vez de quedar con el estado calculado cuando estaba oculta con
     display:none) y refresca los cálculos de los pines por scroll. */
  function refreshViewLayout(){
    // fuerza reflow sincrónico antes de re-observar
    void document.body.offsetHeight;
    reobserveAllReveals();
    requestAnimationFrame(function(){
      window.dispatchEvent(new Event('resize'));
      document.dispatchEvent(new Event('scroll'));
      setTimeout(function(){
        reobserveAllReveals();
        window.dispatchEvent(new Event('resize'));
        document.dispatchEvent(new Event('scroll'));
      }, 50);
    });
  }

  /* ---- Hero: el texto se desvanece hacia arriba al hacer scroll ---- */
  (function(){
    var hero = document.querySelector('.hero');
    var heroInner = document.querySelector('.hero-inner');
    var heroScrollHint = document.querySelector('.hero-scroll');
    if(!hero || !heroInner) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var pinWrap = document.getElementById('heroPinWrap');
    var ticking = false;
    function update(){
      ticking = false;
      var fadeDistance = pinWrap ? (pinWrap.offsetHeight - hero.offsetHeight) : hero.offsetHeight * 0.7;
      fadeDistance = Math.max(fadeDistance, 1);
      var progress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
      heroInner.style.opacity = (1 - progress).toFixed(3);
      heroInner.style.transform = 'translateY(' + (progress * -60).toFixed(1) + 'px)';
      if(heroScrollHint){
        heroScrollHint.style.opacity = (0.75 * (1 - progress)).toFixed(3);
      }
    }
    function onScroll(){
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }
    document.addEventListener('scroll', onScroll, { passive:true });
    update();
  })();

  /* ---- Manifiesto: titulo con revelado ondulado (wave) + CTA desde la derecha ---- */
  (function(){
    var manifiestoTitle = document.querySelector('.manifiesto-title');
    var manifiestoCta = document.querySelector('.manifiesto-cta');
    if(!manifiestoTitle) return;

    var STEP = 0.14;
    var DUR = 1.5;

    var wr = makeWordReveal(manifiestoTitle, {
      step: STEP, duration: DUR,
      onShow: function(wordCount){
        if(manifiestoCta){
          var totalTime = Math.max(0, wordCount - 1) * STEP + DUR;
          var mcDelay = Math.max(0.3, totalTime - 0.3);
          manifiestoCta.style.transitionDelay = mcDelay.toFixed(3) + 's';
          manifiestoCta.classList.add('is-visible');
          clearTimeout(manifiestoCta._revealTimer);
          manifiestoCta._revealTimer = setTimeout(function(){
            manifiestoCta.style.transitionDelay = '';
          }, mcDelay * 1000 + 50);
        }
      },
      onHide: function(){
        if(manifiestoCta){ manifiestoCta.classList.remove('is-visible'); }
      }
    });

    observeReveal(manifiestoTitle, wr, { threshold:0.4, rootMargin:'0px 0px -15% 0px' });
  })();

  /* ---- Metodo 80/20: titulo + lede enmascarados, notas y tarjetas en cascada ---- */
  (function(){
    var section = document.getElementById('metodo');
    var title = document.querySelector('.mt-head h2');
    var lede = document.querySelector('.mt-lede');
    var note1 = document.querySelector('.mt-note');
    var impact = document.querySelector('.mt-impact');
    var card80 = document.querySelector('.mt-card--80');
    var card20 = document.querySelector('.mt-card--20');
    var finalPhrase = document.querySelector('.mt-final');
    if(!section || !title) return;

    var TITLE_STEP = 0.14, TITLE_DUR = 1.5;
    var LEDE_STEP = 0.03, LEDE_DUR = 0.9;
    var LEDE_DELAY = 0.35;

    var wrLede = lede ? makeWordReveal(lede, { step:LEDE_STEP, duration:LEDE_DUR }) : null;
    var ledeWordCount = lede ? lede.textContent.trim().split(/\s+/).length : 0;
    var wrFinal = finalPhrase ? makeWordReveal(finalPhrase, { step:TITLE_STEP, duration:TITLE_DUR }) : null;

    var wrTitle = makeWordReveal(title, {
      step: TITLE_STEP, duration: TITLE_DUR,
      onShow: function(){
        if(wrLede){ wrLede.show(LEDE_DELAY); }

        var ledeTotalTime = LEDE_DELAY + Math.max(0, ledeWordCount - 1) * LEDE_STEP + LEDE_DUR;
        var note1Delay = ledeTotalTime - 0.2;
        if(note1){ note1.style.transitionDelay = note1Delay.toFixed(3) + 's'; note1.classList.add('is-visible'); }

        var impactDelay = note1Delay + 0.18;
        if(impact){ impact.style.transitionDelay = impactDelay.toFixed(3) + 's'; impact.classList.add('is-visible'); }

        var cardsBase = impactDelay + 0.45;
        if(card80){ card80.style.transitionDelay = cardsBase.toFixed(3) + 's'; card80.classList.add('is-visible'); }
        if(card20){ card20.style.transitionDelay = (cardsBase + 0.15).toFixed(3) + 's'; card20.classList.add('is-visible'); }

        if(wrFinal){ wrFinal.show(cardsBase + 0.6); }
      },
      onHide: function(){
        if(wrLede){ wrLede.hide(); }
        if(note1){ note1.classList.remove('is-visible'); }
        if(impact){ impact.classList.remove('is-visible'); }
        if(card80){ card80.classList.remove('is-visible'); }
        if(card20){ card20.classList.remove('is-visible'); }
        if(wrFinal){ wrFinal.hide(); }
      }
    });

    observeReveal(section, wrTitle, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Que hacemos: titulo + parrafo con revelado por palabras, repetible al hacer scroll ---- */
  (function(){
    var qhSection = document.getElementById('que-hacemos');
    var qhTitle = document.querySelector('.qh-head h2');
    var qhText = document.querySelector('.qh-header p');
    if(!qhSection || !qhTitle) return;

    var TITLE_STEP = 0.14, TITLE_DUR = 1.5;
    var TEXT_STEP = 0.025, TEXT_DUR = 1;
    var TEXT_START_DELAY = 0.35;

    var wrTitle = makeWordReveal(qhTitle, { step:TITLE_STEP, duration:TITLE_DUR });
    var wrText = qhText ? makeWordReveal(qhText, { step:TEXT_STEP, duration:TEXT_DUR }) : null;

    var controller = {
      show: function(){
        wrTitle.show();
        if(wrText){ wrText.show(TEXT_START_DELAY); }
      },
      hide: function(){
        wrTitle.hide();
        if(wrText){ wrText.hide(); }
      }
    };

    observeReveal(qhSection, controller, { threshold:0.25, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- CTA banner (consulta gratuita): revelado ondulado + fade secuencial, repetible ---- */
  (function(){
    var ctaBanner = document.getElementById('cta-consulta');
    var ctaTitle = document.querySelector('.cta-banner-title');
    var ctaSubtitle = document.querySelector('.cta-banner-subtitle');
    var ctaBtn = document.querySelector('.cta-banner-btn');
    if(!ctaBanner || !ctaTitle) return;

    var STEP = 0.14;
    var DUR = 1.5;

    var wrSubtitle = ctaSubtitle ? makeWordReveal(ctaSubtitle, { step:0.03, duration:0.9 }) : null;

    var wr = makeWordReveal(ctaTitle, {
      step: STEP, duration: DUR,
      onShow: function(wordCount){
        var totalTime = Math.max(0, wordCount - 1) * STEP + DUR;
        var delay = Math.max(0.3, totalTime - 0.4);
        if(wrSubtitle){ wrSubtitle.show(delay); }
        if(ctaBtn){
          ctaBtn.style.transitionDelay = delay.toFixed(3) + 's';
          ctaBtn.classList.add('is-visible');
          clearTimeout(ctaBtn._revealTimer);
          ctaBtn._revealTimer = setTimeout(function(){
            ctaBtn.style.transitionDelay = '';
          }, delay * 1000 + 50);
        }
      },
      onHide: function(){
        if(wrSubtitle){ wrSubtitle.hide(); }
        if(ctaBtn){ ctaBtn.classList.remove('is-visible'); }
      }
    });

    observeReveal(ctaBanner, wr, { threshold:0.15, rootMargin:'0px 0px -5% 0px' });
  })();

  /* ---- Contacto: titulo ondulado + fade en secuencia para bajada/formulario/redes ---- */
  (function(){
    var section = document.getElementById('contacto');
    var title = document.querySelector('.contacto-text h2');
    var subtitle = document.querySelector('.contacto-text p');
    var form = document.querySelector('.contacto-form');
    var social = document.querySelector('.contacto-social');
    if(!section || !title) return;

    var STEP = 0.08, DUR = 1;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR,
      onShow: function(wordCount){
        var base = Math.max(0, wordCount - 1) * STEP + DUR - 0.3;
        if(subtitle){ subtitle.style.transitionDelay = base.toFixed(3) + 's'; subtitle.classList.add('is-visible'); }
        if(form){ form.style.transitionDelay = (base + 0.1).toFixed(3) + 's'; form.classList.add('is-visible'); }
        if(social){ social.style.transitionDelay = (base + 0.25).toFixed(3) + 's'; social.classList.add('is-visible'); }
      },
      onHide: function(){
        if(subtitle){ subtitle.classList.remove('is-visible'); }
        if(form){ form.classList.remove('is-visible'); }
        if(social){ social.classList.remove('is-visible'); }
      }
    });

    observeReveal(section, wr, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Manifiesto: scroll-linked word highlight ---- */
  var manifiestoP = document.getElementById('manifiestoText');
  var manifiestoSection = document.querySelector('.manifiesto');
  if(manifiestoP && manifiestoSection){
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(manifiestoP.childNodes, function(node){
      if(node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(function(chunk){
          if(chunk.trim() === ''){ if(chunk) frag.appendChild(document.createTextNode(chunk)); return; }
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = chunk;
          frag.appendChild(span);
        });
      } else if(node.nodeType === 1){
        var clone = node.cloneNode(false);
        (node.textContent || '').split(/(\s+)/).forEach(function(chunk){
          if(chunk.trim() === ''){ if(chunk) clone.appendChild(document.createTextNode(chunk)); return; }
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = chunk;
          clone.appendChild(span);
        });
        frag.appendChild(clone);
      }
    });
    manifiestoP.innerHTML = '';
    manifiestoP.appendChild(frag);

    var words = manifiestoP.querySelectorAll('.word');
    var ticking = false;
    var updateHighlight = function(){
      ticking = false;
      var rect = manifiestoSection.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = (vh - rect.top) / (vh * 0.62);
      progress = Math.max(0, Math.min(1, progress));
      var lit = Math.round(progress * words.length);
      for(var i = 0; i < words.length; i++){
        if(i < lit){ words[i].classList.add('is-lit'); }
        else{ words[i].classList.remove('is-lit'); }
      }
    };
    var onManifiestoScroll = function(){
      if(!ticking){
        ticking = true;
        window.requestAnimationFrame(updateHighlight);
      }
    };
    document.addEventListener('scroll', onManifiestoScroll, { passive:true });
    window.addEventListener('resize', onManifiestoScroll);
    updateHighlight();
  }

  /* ---- Wild Lab: "El instinto te dice..." - titulo ondulado desde la derecha ---- */
  (function(){
    var section = document.getElementById('wl-intro');
    var title = section ? section.querySelector('h2') : null;
    var sub = section ? section.querySelector('.wl-intro-highlight') : null;
    if(!section || !title) return;

    var STEP = 0.09, DUR = 1.5;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR, wrapFn: wrapWordsPlain, animationName: 'wordSlideIn',
      onShow: function(wordCount){
        if(sub){
          var delay = Math.max(0, wordCount - 1) * STEP + DUR - 0.5;
          sub.style.transitionDelay = delay.toFixed(3) + 's';
          sub.classList.add('is-visible');
        }
      },
      onHide: function(){
        if(sub){ sub.classList.remove('is-visible'); }
      }
    });

    observeReveal(section, wr, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Wild Lab: encabezado "4 formas..." con revelado por palabras ---- */
  (function(){
    var header = document.querySelector('.wl-sv-header h2');
    if(!header) return;
    var wr = makeWordReveal(header, { step:0.05, duration:0.9 });
    observeReveal(header, wr, { threshold:0.25, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Wild Lab: cierre "Deja de decidir a ciegas" - titulo ondulado + fade en secuencia ---- */
  (function(){
    var section = document.getElementById('wl-contacto');
    var title = section ? section.querySelector('h2') : null;
    var para = section ? section.querySelector('.wrap > p') : null;
    var ctas = section ? section.querySelector('.wl-contacto-ctas') : null;
    var meta = section ? section.querySelector('.wl-contacto-meta') : null;
    if(!section || !title) return;

    var STEP = 0.06, DUR = 1;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR,
      onShow: function(wordCount){
        var base = Math.max(0, wordCount - 1) * STEP + DUR - 0.3;
        [para, ctas, meta].forEach(function(el, i){
          if(!el) return;
          el.style.transitionDelay = (base + i * 0.15).toFixed(3) + 's';
          el.classList.add('is-visible');
        });
      },
      onHide: function(){
        [para, ctas, meta].forEach(function(el){ if(el){ el.classList.remove('is-visible'); } });
      }
    });

    observeReveal(section, wr, { threshold:0.25, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Wild Lab: acordeón de servicios ---- */
  var wlAccordion = document.getElementById('wlServicesAccordion');
  if(wlAccordion){
    var wlAccItems = wlAccordion.querySelectorAll('.wl-acc-item');
    wlAccItems.forEach(function(item){
      var trigger = item.querySelector('.wl-acc-trigger');
      trigger.addEventListener('click', function(){
        var isOpen = item.classList.contains('is-open');
        wlAccItems.forEach(function(i){ i.classList.remove('is-open'); i.querySelector('.wl-acc-trigger').setAttribute('aria-expanded','false'); });
        if(!isOpen){ item.classList.add('is-open'); trigger.setAttribute('aria-expanded','true'); }
      });
    });
  }

  /* ---- Wild Lab: demo dashboard (Chart.js) — datos de demostración ---- */
  var WL_DATA = {
    comercial: {
      title: 'Facturación mensual por canal',
      secondary: 'Distribución por segmento',
      labels: ['Ene','Feb','Mar','Abr','May','Jun'],
      series: [
        { label:'Directo', data:[42,48,44,55,60,66], color:'#E48C34' },
        { label:'Distribuidores', data:[30,29,33,31,35,34], color:'#131C11' }
      ],
      pie: { labels:['PyME','Corporativo','Exportación'], data:[46,34,20], colors:['#E48C34','#131C11','#E3AA98'] },
      kpi1v:'18,4%', kpi1l:'Crecimiento vs. año anterior',
      kpi2v:'3,2 días', kpi2l:'Tiempo prom. de cierre'
    },
    operativa: {
      title: 'Tiempos de proceso por área (hs)',
      secondary: 'Costos logísticos por destino',
      labels: ['Ene','Feb','Mar','Abr','May','Jun'],
      series: [
        { label:'Producción', data:[120,110,132,118,125,109], color:'#E48C34' },
        { label:'Logística', data:[64,70,58,66,60,52], color:'#131C11' }
      ],
      pie: { labels:['CABA / GBA','Interior','Exportación'], data:[38,41,21], colors:['#E48C34','#131C11','#E3AA98'] },
      kpi1v:'−12%', kpi1l:'Tiempo de ciclo vs. trimestre anterior',
      kpi2v:'96,4%', kpi2l:'Entregas a tiempo'
    }
  };

  var wlMainChart, wlPieChart, wlChartsReady = false;

  function wlRenderCharts(view){
    if(typeof Chart === 'undefined') return;
    var d = WL_DATA[view];
    document.getElementById('wlChartTitle').textContent = d.title;
    document.getElementById('wlSecondaryTitle').textContent = d.secondary;
    document.getElementById('wlKpi1v').textContent = d.kpi1v;
    document.getElementById('wlKpi1l').textContent = d.kpi1l;
    document.getElementById('wlKpi2v').textContent = d.kpi2v;
    document.getElementById('wlKpi2l').textContent = d.kpi2l;

    var fontColor = '#6b776a';
    var gridColor = 'rgba(23,57,31,.08)';

    if(wlMainChart) wlMainChart.destroy();
    var ctx1 = document.getElementById('wlMainChart').getContext('2d');
    wlMainChart = new Chart(ctx1, {
      type:'bar',
      data:{
        labels:d.labels,
        datasets:d.series.map(function(s){
          return { label:s.label, data:s.data, backgroundColor:s.color, borderRadius:3, maxBarThickness:22 };
        })
      },
      options:{
        responsive:true,
        plugins:{ legend:{ labels:{ color:fontColor, font:{ family:'Montserrat', size:11 } } } },
        scales:{
          x:{ ticks:{ color:fontColor, font:{ family:'Montserrat', size:10 } }, grid:{ display:false } },
          y:{ ticks:{ color:fontColor, font:{ family:'Montserrat', size:10 } }, grid:{ color:gridColor } }
        }
      }
    });

    if(wlPieChart) wlPieChart.destroy();
    var ctx2 = document.getElementById('wlPieChart').getContext('2d');
    wlPieChart = new Chart(ctx2, {
      type:'doughnut',
      data:{
        labels:d.pie.labels,
        datasets:[{ data:d.pie.data, backgroundColor:d.pie.colors, borderColor:'#FFFFFF', borderWidth:2 }]
      },
      options:{
        responsive:true,
        plugins:{ legend:{ position:'bottom', labels:{ color:fontColor, font:{ family:'Montserrat', size:10 }, boxWidth:10 } } }
      }
    });
  }

  document.querySelectorAll('#wlDemoToggle button').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('#wlDemoToggle button').forEach(function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      wlRenderCharts(btn.dataset.view);
    });
  });

  /* ---- Wild Lab: vista independiente (no forma parte del scroll de la home) ---- */
  var wildLabSection = document.getElementById('wild-lab');
  var laManadaSection = document.getElementById('la-manada');

  /* Rutas propias: si ya estamos en /wild-impact o /wild-lab no hace
     falta (ni conviene) reescribir la URL con el hash de esa misma vista. */
  function isOwnPath(name){
    return new RegExp('(^|/)' + name + '(\\.html)?/?$').test(window.location.pathname);
  }

  function showWildLab(){
    document.documentElement.style.overflow = '';
    lmCloseModal();
    homeView.classList.add('is-hidden');
    wildImpactSection.classList.remove('is-active');
    if(laManadaSection){ laManadaSection.classList.remove('is-active'); }
    wildLabSection.classList.add('is-active');
    window.scrollTo(0,0);
    links.forEach(function(a){ a.classList.remove('is-active'); });
    var wlLink = document.querySelector('.main-nav a[href="/wild-lab"]');
    if(wlLink){ wlLink.classList.add('is-active'); }
    if(!isOwnPath('wild-lab')){ history.replaceState(null, '', '#wild-lab'); }
    syncWlVideo();
    if(!wlChartsReady){ wlChartsReady = true; wlRenderCharts('comercial'); }
    refreshViewLayout();
  }

  /* ---- services accordion ---- */
  var accordion = document.getElementById('servicesAccordion');
  if(accordion){
    accordion.querySelectorAll('.acc-trigger').forEach(function(trigger){
      trigger.addEventListener('click', function(){
        var item = trigger.closest('.acc-item');
        var open = item.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    var accItems = accordion.querySelectorAll('.acc-item');
    var accStaggerController = {
      show: function(){
        accItems.forEach(function(item, i){
          item.style.transitionDelay = (i * 0.1).toFixed(2) + 's';
          item.classList.add('is-visible');
        });
      },
      hide: function(){
        accItems.forEach(function(item){ item.classList.remove('is-visible'); });
      }
    };
    observeReveal(accordion, accStaggerController, { threshold:0.15, rootMargin:'0px 0px -10% 0px' });
  }

  /* ---- Wild Impact: titulos de seccion con revelado por palabras, repetible ---- */
  (function(){
    var headings = document.querySelectorAll('.wi-heading');
    headings.forEach(function(h){
      var wr = makeWordReveal(h, { step:0.06, duration:1 });
      observeReveal(h, wr, { threshold:0.3, rootMargin:'0px 0px -10% 0px' });
    });
  })();

  /* ---- Wild Impact: "Para vos si:" - titulo desliza desde la izquierda, lista escalonada ---- */
  (function(){
    var wiFit = document.querySelector('.wi-fit');
    var title = document.querySelector('.wi-fit-inner h2');
    var items = document.querySelectorAll('.wi-fit-list li');
    if(!wiFit || !title) return;

    var STEP = 0.09, DUR = 0.5;
    var ITEM_STEP = 0.09, ITEM_DUR = 0.6;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR, wrapFn: wrapWordsPlain, animationName: 'wordSlideIn',
      onShow: function(wordCount){
        var titleTotalTime = Math.max(0, wordCount - 1) * STEP + DUR;
        items.forEach(function(li, i){
          li.style.transitionDelay = (titleTotalTime + i * ITEM_STEP).toFixed(3) + 's';
          li.classList.add('is-visible');
        });
      },
      onHide: function(){
        items.forEach(function(li){ li.classList.remove('is-visible'); });
      }
    });

    observeReveal(wiFit, wr, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Wild Impact: cierre final - titulo ondulado + CTA/redes en secuencia ---- */
  (function(){
    var wiFinal = document.querySelector('.wi-final');
    var title = wiFinal ? wiFinal.querySelector('h2') : null;
    var cta = wiFinal ? wiFinal.querySelector('.acc-cta') : null;
    var social = wiFinal ? wiFinal.querySelector('.wi-final-social') : null;
    if(!wiFinal || !title) return;

    var STEP = 0.06, DUR = 1;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR,
      onShow: function(wordCount){
        var delay = (Math.max(0, wordCount - 1) * STEP + DUR - 0.3).toFixed(3) + 's';
        if(cta){ cta.style.transitionDelay = delay; cta.classList.add('is-visible'); }
        if(social){ social.style.transitionDelay = delay; social.classList.add('is-visible'); }
      },
      onHide: function(){
        if(cta){ cta.classList.remove('is-visible'); }
        if(social){ social.classList.remove('is-visible'); }
      }
    });

    observeReveal(wiFinal, wr, { threshold:0.3, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Wild Impact: video de fondo ---- */
  var wiVideoDesktop = document.getElementById('wiVideoDesktop');
  var wiVideoMobile = document.getElementById('wiVideoMobile');
  wireVideo(wiVideoDesktop);
  wireVideo(wiVideoMobile);
  function syncWiVideo(){
    var active = mobileQuery.matches ? wiVideoMobile : wiVideoDesktop;
    var idle = mobileQuery.matches ? wiVideoDesktop : wiVideoMobile;
    if(idle){ idle.pause(); }
    if(active){
      if(active.preload !== 'auto'){ active.preload = 'auto'; active.load(); }
      var p = active.play();
      if(p && p.catch){ p.catch(function(){}); }
    }
  }

  /* ---- Wild Lab: video de fondo ---- */
  var wlVideoDesktop = document.getElementById('wlVideoDesktop');
  var wlVideoMobile = document.getElementById('wlVideoMobile');
  wireVideo(wlVideoDesktop);
  wireVideo(wlVideoMobile);
  function syncWlVideo(){
    var active = mobileQuery.matches ? wlVideoMobile : wlVideoDesktop;
    var idle = mobileQuery.matches ? wlVideoDesktop : wlVideoMobile;
    if(idle){ idle.pause(); }
    if(active){
      if(active.preload !== 'auto'){ active.preload = 'auto'; active.load(); }
      var p = active.play();
      if(p && p.catch){ p.catch(function(){}); }
    }
  }

  /* ---- Wild Impact: vista independiente (no forma parte del scroll de la home) ---- */
  var homeView = document.getElementById('homeView');
  var wildImpactSection = document.getElementById('wild-impact');

  function showWildImpact(){
    document.documentElement.style.overflow = '';
    lmCloseModal();
    homeView.classList.add('is-hidden');
    wildImpactSection.classList.add('is-active');
    if(typeof wildLabSection !== 'undefined' && wildLabSection){ wildLabSection.classList.remove('is-active'); }
    if(laManadaSection){ laManadaSection.classList.remove('is-active'); }
    window.scrollTo(0,0);
    links.forEach(function(a){ a.classList.remove('is-active'); });
    var wiLink = document.querySelector('.main-nav a[href="/wild-impact"]');
    if(wiLink){ wiLink.classList.add('is-active'); }
    if(!isOwnPath('wild-impact')){ history.replaceState(null, '', '#wild-impact'); }
    syncWiVideo();
    refreshViewLayout();
  }

  function showHome(targetId){
    document.documentElement.style.overflow = '';
    lmCloseModal();
    wildImpactSection.classList.remove('is-active');
    if(typeof wildLabSection !== 'undefined' && wildLabSection){ wildLabSection.classList.remove('is-active'); }
    if(laManadaSection){ laManadaSection.classList.remove('is-active'); }
    homeView.classList.remove('is-hidden');
    links.forEach(function(a){ a.classList.remove('is-active'); });
    if(targetId && targetId !== '#home'){
      var target = document.querySelector(targetId);
      if(target){
        var targetLink = document.querySelector('.main-nav a[href="' + targetId + '"]');
        if(targetLink){ targetLink.classList.add('is-active'); }
        requestAnimationFrame(function(){ target.scrollIntoView({ behavior:'auto', block:'start' }); });
      }
    } else {
      var homeLink = document.querySelector('.main-nav a[href="#home"]');
      if(homeLink){ homeLink.classList.add('is-active'); }
      window.scrollTo(0,0);
    }
    var onOwnRoute = isOwnPath('wild-impact') || isOwnPath('wild-lab');
    var newUrl = targetId && targetId !== '#home' ? targetId : '#home';
    if(onOwnRoute){ newUrl = '/' + (newUrl === '#home' ? '' : newUrl); }
    history.replaceState(null, '', newUrl);
    syncActiveVideo();
    refreshViewLayout();
  }

  function showLaManada(){
    if(!laManadaSection) return;
    homeView.classList.add('is-hidden');
    wildImpactSection.classList.remove('is-active');
    if(typeof wildLabSection !== 'undefined' && wildLabSection){ wildLabSection.classList.remove('is-active'); }
    laManadaSection.classList.add('is-active');
    window.scrollTo(0,0);
    links.forEach(function(a){ a.classList.remove('is-active'); });
    var lmLink = document.querySelector('.main-nav a[href="#la-manada"]');
    if(lmLink){ lmLink.classList.add('is-active'); }
    history.replaceState(null, '', '#la-manada');
    lmOpenModal();
    lmUpdateHero();
    lmUpdateScene();
    refreshViewLayout();
  }

  document.querySelectorAll('.main-nav a, .brand, .wild-lab a[href="#contacto"], .wild-impact a[href="#contacto"], .la-manada a[href="#contacto"], .manifiesto-cta').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) !== '#'){ return; }
      if(href === '#wild-impact'){
        e.preventDefault();
        showWildImpact();
      } else if(href === '#wild-lab'){
        e.preventDefault();
        showWildLab();
      } else if(href === '#la-manada'){
        e.preventDefault();
        showLaManada();
      } else if(homeView.querySelector(href)){
        e.preventDefault();
        showHome(href);
      }
    });
  });

  /* Rutas propias (/wild-impact, /wild-lab): mismo router de vistas,
     disparado también por la URL real y no solo por el hash. */
  var initialPath = window.location.pathname.replace(/\/index\.html$/, '/');
  var isWildImpactPath = /(^|\/)wild-impact(\.html)?\/?$/.test(initialPath);
  var isWildLabPath = /(^|\/)wild-lab(\.html)?\/?$/.test(initialPath);

  if(window.location.hash === '#wild-impact' || isWildImpactPath){
    showWildImpact();
  } else if(window.location.hash === '#wild-lab' || isWildLabPath){
    showWildLab();
  } else if(window.location.hash === '#la-manada'){
    showLaManada();
  }

  /* ==================================================================
     LA MANADA: modal de bienvenida, hero, pin horizontal, split y
     valores. Todo repetible al re-entrar a la vista, respeta
     prefers-reduced-motion y no corre cálculos mientras la vista
     está oculta.
     ================================================================== */
  var lmReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Sección 0: modal de bienvenida ---- */
  var lmModal = document.getElementById('lmModal');
  var lmModalClose = document.getElementById('lmModalClose');
  function lmOpenModal(){
    if(!lmModal) return;
    lmModal.classList.remove('is-hidden');
    lmModal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }
  function lmCloseModal(){
    if(!lmModal) return;
    lmModal.classList.add('is-hidden');
    lmModal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }
  if(lmModalClose){ lmModalClose.addEventListener('click', lmCloseModal); }

  /* ---- Sección 1: hero - switch estricto por scroll (no crossfade): la frase 2
     reemplaza a la 1 en el mismo lugar de una sola vez al cruzar el 50% del
     pin. display+visibility+opacity juntos, para que quede binario sin
     posibilidad de que ambas queden visibles a la vez. ---- */
  var lmHeroPinWrap = document.getElementById('lmHeroPinWrap');
  var lmHeroLine1 = document.querySelector('.lm-hero-line-1');
  var lmHeroLine2 = document.querySelector('.lm-hero-line-2');
  var LM_HERO_SWITCH = 0.08;
  function lmSetHeroLine(el, isVisible){
    el.style.display = isVisible ? 'block' : 'none';
    el.style.visibility = isVisible ? 'visible' : 'hidden';
    el.style.opacity = isVisible ? '1' : '0';
  }
  function lmUpdateHero(){
    if(!lmHeroPinWrap || !lmHeroLine1 || !lmHeroLine2) return;
    if(!laManadaSection.classList.contains('is-active')) return;
    if(lmReducedMotion.matches) return;
    var rect = lmHeroPinWrap.getBoundingClientRect();
    var scrollable = lmHeroPinWrap.offsetHeight - window.innerHeight;
    if(scrollable <= 0) return;
    var progress = (-rect.top) / scrollable;
    progress = Math.max(0, Math.min(1, progress));

    if(progress < LM_HERO_SWITCH){
      lmSetHeroLine(lmHeroLine1, true);
      lmSetHeroLine(lmHeroLine2, false);
    } else {
      lmSetHeroLine(lmHeroLine1, false);
      lmSetHeroLine(lmHeroLine2, true);
    }
  }
  (function(){
    var ticking = false;
    function onScroll(){
      if(!ticking){
        ticking = true;
        requestAnimationFrame(function(){ ticking = false; lmUpdateHero(); });
      }
    }
    document.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', lmUpdateHero);
  })();

  /* ---- Sección 2: manifiesto - pin horizontal vía scroll ---- */
  var lmSceneWrap = document.getElementById('lmSceneWrap');
  var lmSceneTrack = document.getElementById('lmSceneTrack');
  function lmUpdateScene(){
    if(!lmSceneWrap || !lmSceneTrack) return;
    if(!laManadaSection.classList.contains('is-active')) return;
    if(mobileQuery.matches || lmReducedMotion.matches) return;
    var rect = lmSceneWrap.getBoundingClientRect();
    var scrollable = lmSceneWrap.offsetHeight - window.innerHeight;
    if(scrollable <= 0){ lmSceneTrack.style.transform = 'translateX(0%)'; return; }
    var progress = (-rect.top) / scrollable;
    progress = Math.max(0, Math.min(1, progress));
    lmSceneTrack.style.transform = 'translateX(-' + (progress * 50).toFixed(3) + '%)';
  }
  (function(){
    var ticking = false;
    function onScroll(){
      if(!ticking){
        ticking = true;
        requestAnimationFrame(function(){ ticking = false; lmUpdateScene(); });
      }
    }
    document.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', lmUpdateScene);
  })();

  /* ---- Sección 4: split "no hacemos / sí creemos" ---- */
  (function(){
    var split = document.getElementById('lm-split');
    if(!split) return;
    var controller = {
      show: function(){ split.classList.add('is-visible'); },
      hide: function(){ split.classList.remove('is-visible'); }
    };
    observeReveal(split, controller, { threshold:0.25, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Sección 5: valores - titulo zoom, lista escalonada, sello final ---- */
  (function(){
    var section = document.getElementById('lm-values');
    if(!section) return;
    var title = section.querySelector('.lm-values-title');
    var items = section.querySelectorAll('.lm-values-list li');
    var stamp = section.querySelector('.lm-values-stamp');
    var STEP = 0.12;
    var controller = {
      show: function(){
        if(title){ title.classList.add('is-visible'); }
        items.forEach(function(li, i){
          li.style.transitionDelay = (0.3 + i * STEP).toFixed(2) + 's';
          li.classList.add('is-visible');
        });
        if(stamp){
          var stampDelay = 0.3 + items.length * STEP + 0.2;
          stamp.style.transitionDelay = stampDelay.toFixed(2) + 's';
          stamp.classList.add('is-visible');
        }
      },
      hide: function(){
        if(title){ title.classList.remove('is-visible'); }
        items.forEach(function(li){ li.classList.remove('is-visible'); });
        if(stamp){ stamp.classList.remove('is-visible'); }
      }
    };
    observeReveal(section, controller, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Sección 6: visión - título con reveal por palabras, párrafo con fade suave y delay ---- */
  (function(){
    var section = document.getElementById('lm-vision');
    var title = section ? section.querySelector('.lm-vision-title') : null;
    var body = section ? section.querySelector('.lm-vision-body') : null;
    if(!section || !title) return;

    var STEP = 0.045, DUR = 0.6;
    var BODY_DELAY = 0.2;

    var wr = makeWordReveal(title, {
      step: STEP, duration: DUR,
      onShow: function(){
        if(body){
          body.style.transitionDelay = BODY_DELAY.toFixed(2) + 's';
          body.classList.add('is-visible');
        }
      },
      onHide: function(){
        if(body){ body.classList.remove('is-visible'); }
      }
    });

    observeReveal(section, wr, { threshold:0.25, rootMargin:'0px 0px -10% 0px' });
  })();

  /* ---- Formulario de contacto (envia los datos por email via FormSubmit) ---- */
  var contactoForm = document.getElementById('contactoForm');
  if(contactoForm){
    var CONTACTO_ENDPOINT = 'https://formsubmit.co/ajax/wildpackstudioar@gmail.com';
    contactoForm.addEventListener('submit', function(e){
      e.preventDefault();
      var confirmMsg = document.getElementById('contactoConfirm');
      var errorMsg = document.getElementById('contactoError');
      var submitBtn = document.getElementById('contactoSubmitBtn');
      if(confirmMsg){ confirmMsg.hidden = true; }
      if(errorMsg){ errorMsg.hidden = true; }
      if(submitBtn){ submitBtn.disabled = true; }

      var formData = new FormData(contactoForm);
      var payload = {
        nombre: formData.get('nombre') || '',
        email: formData.get('email') || '',
        empresa: formData.get('empresa') || '',
        mensaje: formData.get('mensaje') || '',
        _subject: 'Nuevo contacto desde wildpackstudio.com'
      };

      fetch(CONTACTO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function(res){
          if(!res.ok){ throw new Error('Respuesta no OK'); }
          if(confirmMsg){ confirmMsg.hidden = false; }
          contactoForm.reset();
        })
        .catch(function(){
          if(errorMsg){ errorMsg.hidden = false; }
        })
        .finally(function(){
          if(submitBtn){ submitBtn.disabled = false; }
        });
    });
  }

})();
