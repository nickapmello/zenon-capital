/**
 * Zenon Capital — Integração Real do Formulário de Contato
 * Endpoint: /api/contact -> contato@zenoncapital.com.br
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const formStatus = document.getElementById('formStatus');

  const fields = {
    nome: document.getElementById('nome'),
    email: document.getElementById('email'),
    telefone: document.getElementById('telefone'),
    assunto: document.getElementById('assunto'),
    mensagem: document.getElementById('mensagem'),
    gotcha: document.getElementById('_gotcha')
  };

  let isSubmitting = false;

  // --- 0. Preenchimento Automático do Serviço Escolhido no Formulário ---
  function selectService(serviceKey) {
    if (!fields.assunto || !serviceKey) return false;

    const normalizedKey = String(serviceKey).trim().toLowerCase();

    // Mapeamento canônico de chaves e aliases para o valor exato da opção
    const aliasMap = {
      'diagnostico': 'diagnostico',
      'diagnostico-zenon': 'diagnostico',
      'reforma-tributaria': 'reforma-tributaria',
      'reforma': 'reforma-tributaria',
      'adequacao-reforma': 'reforma-tributaria',
      'fusoes-aquisicoes': 'fusoes-aquisicoes',
      'fusoes': 'fusoes-aquisicoes',
      'm-and-a': 'fusoes-aquisicoes',
      'valuation': 'fusoes-aquisicoes',
      'inteligencia-tributaria': 'inteligencia-tributaria',
      'inteligencia': 'inteligencia-tributaria',
      'credito': 'credito',
      'credito-antecipacao': 'credito',
      'linhas-credito': 'credito',
      'mini-banco': 'mini-banco',
      'mini-banco-proprietario': 'mini-banco',
      'mercado-capitais': 'mercado-capitais',
      'mercado-de-capitais': 'mercado-capitais',
      'investimento-expansao': 'investimento-expansao',
      'investimento': 'investimento-expansao',
      'outro': 'outro'
    };

    const targetVal = aliasMap[normalizedKey] || normalizedKey;
    const optionExists = Array.from(fields.assunto.options).some(opt => opt.value === targetVal);

    if (optionExists) {
      fields.assunto.value = targetVal;
      clearFieldError('assunto');

      // Micro-interação visual: feedback sutil dourado no campo
      fields.assunto.classList.remove('field-highlight');
      void fields.assunto.offsetWidth; // Força repaint
      fields.assunto.classList.add('field-highlight');
      setTimeout(() => {
        fields.assunto.classList.remove('field-highlight');
      }, 1600);

      fields.assunto.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  // Intercepta cliques em links com atributo data-service ou com parâmetros na URL
  document.addEventListener('click', (e) => {
    const serviceLink = e.target.closest('a[data-service], a[href*="servico="], a[href*="assunto="]');
    if (!serviceLink) return;

    let service = serviceLink.getAttribute('data-service');
    if (!service) {
      try {
        const url = new URL(serviceLink.href, window.location.origin);
        service = url.searchParams.get('servico') || url.searchParams.get('assunto');
      } catch {
        const match = serviceLink.href.match(/[?&](servico|assunto)=([^&#]+)/);
        if (match) service = match[2];
      }
    }

    if (service) {
      selectService(service);
    }
  });

  // Lê parâmetros da URL ao carregar ou trocar hash (suporta ?servico=... e #stage-contato?servico=...)
  function checkUrlServiceParams() {
    let service = null;

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      service = params.get('servico') || params.get('assunto');
    }

    if (!service && window.location.hash) {
      const hash = window.location.hash;
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.substring(queryIdx));
        service = params.get('servico') || params.get('assunto');
      }
    }

    if (service) {
      selectService(service);
    }
  }

  checkUrlServiceParams();
  window.addEventListener('hashchange', checkUrlServiceParams);

  // --- 1. Máscara Inteligente de Telefone (DDD + 8 ou 9 dígitos) ---
  if (fields.telefone) {
    fields.telefone.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);

      if (v.length > 10) {
        // Celular: (XX) XXXXX-XXXX
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7, 11)}`;
      } else if (v.length > 6) {
        // Fixo ou parcial: (XX) XXXX-XXXX
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6, 10)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  }

  // --- 2. Limpeza de Erros ao Digitar / Alterar ---
  function clearFieldError(fieldName) {
    const field = fields[fieldName];
    if (!field) return;
    const group = field.closest('.form-group');
    if (group) group.classList.remove('has-error');
    const errSpan = document.getElementById(`error-${fieldName}`);
    if (errSpan) errSpan.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function setFieldError(fieldName, message) {
    const field = fields[fieldName];
    if (!field) return;
    const group = field.closest('.form-group');
    if (group) group.classList.add('has-error');
    const errSpan = document.getElementById(`error-${fieldName}`);
    if (errSpan) errSpan.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  }

  Object.keys(fields).forEach(key => {
    const el = fields[key];
    if (el) {
      el.addEventListener('input', () => clearFieldError(key));
      el.addEventListener('change', () => clearFieldError(key));
    }
  });

  // --- 3. Submissão do Formulário com Validação e Prevenção de Duplicidade ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Limpar estado anterior
    if (formStatus) {
      formStatus.style.display = 'none';
      formStatus.className = 'form-status';
      formStatus.innerHTML = '';
    }

    let isValid = true;
    let firstInvalid = null;

    // Validação Nome
    const nomeVal = fields.nome ? fields.nome.value.trim() : '';
    if (!nomeVal || nomeVal.length < 2) {
      setFieldError('nome', 'Por favor, informe seu nome completo.');
      isValid = false;
      if (!firstInvalid) firstInvalid = fields.nome;
    } else {
      clearFieldError('nome');
    }

    // Validação E-mail
    const emailVal = fields.email ? fields.email.value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setFieldError('email', 'Por favor, informe um e-mail válido.');
      isValid = false;
      if (!firstInvalid) firstInvalid = fields.email;
    } else {
      clearFieldError('email');
    }

    // Validação Telefone
    const rawPhone = fields.telefone ? fields.telefone.value.replace(/\D/g, '') : '';
    if (!rawPhone || rawPhone.length < 10) {
      setFieldError('telefone', 'Por favor, informe um telefone com DDD.');
      isValid = false;
      if (!firstInvalid) firstInvalid = fields.telefone;
    } else {
      clearFieldError('telefone');
    }

    // Validação Assunto
    const assuntoVal = fields.assunto ? fields.assunto.value : '';
    if (!assuntoVal || assuntoVal === '') {
      setFieldError('assunto', 'Selecione uma opção de atendimento.');
      isValid = false;
      if (!firstInvalid) firstInvalid = fields.assunto;
    } else {
      clearFieldError('assunto');
    }

    if (!isValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Trava de Envio e Estado de Carregamento
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
    }
    if (btnText) {
      btnText.textContent = 'Enviando...';
    }

    // Desabilita inputs temporariamente para impedir edições em trânsito
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => input.disabled = true);

    const payload = {
      nome: nomeVal,
      email: emailVal,
      telefone: fields.telefone ? fields.telefone.value.trim() : '',
      assunto: assuntoVal,
      mensagem: fields.mensagem ? fields.mensagem.value.trim() : '',
      _gotcha: fields.gotcha ? fields.gotcha.value : ''
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && data && data.success) {
        // Sucesso Confirmado pelo Serviço
        if (formStatus) {
          formStatus.className = 'form-status is-success';
          formStatus.style.display = 'block';
          formStatus.innerHTML = `
            <div class="form-status-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="vertical-align: middle;">
                <circle cx="10" cy="10" r="9" stroke="#2B6E4F" stroke-width="2"/>
                <path d="M6 10L9 13L14 7" stroke="#2B6E4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Mensagem enviada com sucesso!</span>
            </div>
            <div class="form-status-details">
              Recebemos sua solicitação para <strong>contato@zenoncapital.com.br</strong>. Nossa equipe entrará em contato em breve.
            </div>
          `;
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Reseta o formulário
        form.reset();
      } else {
        // Erro ou Pendência de Credenciais do Servidor
        const errorTitle = data && data.error ? data.error : 'Não foi possível enviar a mensagem.';
        const errorDetails = data && data.details ? data.details : 'Por favor, tente novamente em instantes ou entre em contato diretamente pelo WhatsApp.';
        
        let pendenciasHtml = '';
        if (data && data.pendencias && Array.isArray(data.pendencias)) {
          pendenciasHtml = `
            <ul class="form-status-list">
              ${data.pendencias.map(p => `<li>${p}</li>`).join('')}
            </ul>
          `;
        }

        // Se o servidor retornou erros específicos em campos
        if (data && data.fields) {
          Object.keys(data.fields).forEach(fName => {
            setFieldError(fName, data.fields[fName]);
          });
        }

        if (formStatus) {
          formStatus.className = 'form-status is-error';
          formStatus.style.display = 'block';
          formStatus.innerHTML = `
            <div class="form-status-title">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="vertical-align: middle;">
                <circle cx="10" cy="10" r="9" stroke="#A93829" stroke-width="2"/>
                <line x1="10" y1="6" x2="10" y2="11" stroke="#A93829" stroke-width="2" stroke-linecap="round"/>
                <circle cx="10" cy="14" r="1" fill="#A93829"/>
              </svg>
              <span>${errorTitle}</span>
            </div>
            <div class="form-status-details">${errorDetails}</div>
            ${pendenciasHtml}
          `;
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    } catch (networkError) {
      console.error('[Form Submit Error]', networkError);
      if (formStatus) {
        formStatus.className = 'form-status is-error';
        formStatus.style.display = 'block';
        formStatus.innerHTML = `
          <div class="form-status-title">Falha de conexão com o servidor</div>
          <div class="form-status-details">Não foi possível conectar ao serviço de envio. Verifique sua conexão à internet e tente novamente.</div>
        `;
      }
    } finally {
      // Reativa os campos e o botão
      allInputs.forEach(input => input.disabled = false);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
      }
      if (btnText) {
        btnText.textContent = 'Enviar mensagem';
      }
      isSubmitting = false;
    }
  });
});
