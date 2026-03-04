const navToggle = document.querySelector('.nav-toggle')
const navList = document.querySelector('.nav-list')
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true'
    navToggle.setAttribute('aria-expanded', String(!expanded))
    navList.classList.toggle('open')
  })
}

document.getElementById('year').textContent = new Date().getFullYear()

const links = document.querySelectorAll('.nav-link')
links.forEach(l => {
  l.addEventListener('click', e => {
    e.preventDefault()
    const id = l.getAttribute('href')
    const target = document.querySelector(id)
    if (!target) return
    const y = target.getBoundingClientRect().top + window.pageYOffset - 60
    window.scrollTo({ top: y, behavior: 'smooth' })
    navList.classList.remove('open')
    navToggle.setAttribute('aria-expanded', 'false')
  })
})

const sections = document.querySelectorAll('section[id]')
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id')
      const a = document.querySelector(`.nav-link[href="#${id}"]`)
      if (a) {
        if (entry.isIntersecting) {
          links.forEach(x => x.classList.remove('active'))
          a.classList.add('active')
        }
      }
    })
  },
  { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.3, 0.6] }
)
sections.forEach(s => observer.observe(s))

const copyBtns = document.querySelectorAll('.copy')
copyBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy')
    try {
      await navigator.clipboard.writeText(text)
      const old = btn.textContent
      btn.textContent = '已复制'
      setTimeout(() => (btn.textContent = old), 1600)
    } catch {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  })
})

document.querySelectorAll('.avatar-img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none'
  })
})

const avatarImg = document.querySelector('.avatar-img')
const ownerMode = new URLSearchParams(location.search).has('edit')

const processImageFile = (file, cb) => {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      const canvas = document.createElement('canvas')
      const target = 800
      canvas.width = target
      canvas.height = target
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      cb(dataUrl)
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

try {
  const cached = localStorage.getItem('avatarData')
  if (cached && avatarImg) avatarImg.src = cached
} catch {}
// 头像编辑功能仅在 ownerMode 下启用（访问链接带 ?edit 即可）
if (ownerMode) {
  const avatarFigure = document.querySelector('.avatar')
  // 动态创建更换/保存控件与文件输入，避免常态显示
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.style.display = 'none'
  document.body.appendChild(input)
  const addControls = () => {
    if (!avatarFigure) return
    const changeBtn = document.createElement('button')
    changeBtn.className = 'avatar-change'
    changeBtn.type = 'button'
    changeBtn.textContent = '更换头像'
    const saveBtn = document.createElement('button')
    saveBtn.className = 'avatar-save'
    saveBtn.type = 'button'
    saveBtn.textContent = '保存'
    avatarFigure.appendChild(changeBtn)
    avatarFigure.appendChild(saveBtn)
    changeBtn.addEventListener('click', () => input.click())
    saveBtn.addEventListener('click', () => {
      if (!avatarImg || !avatarImg.src) return
      const a = document.createElement('a')
      a.download = 'avatar.jpg'
      a.href = avatarImg.src
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }
  addControls()
  input.addEventListener('change', () => {
    const f = input.files && input.files[0]
    if (!f) return
    processImageFile(f, data => {
      avatarImg.src = data
      try { localStorage.setItem('avatarData', data) } catch {}
    })
  })

  if (avatarFigure && avatarImg) {
    avatarFigure.addEventListener('dragover', e => {
      e.preventDefault()
    })
    avatarFigure.addEventListener('drop', e => {
      e.preventDefault()
      const f = e.dataTransfer.files && e.dataTransfer.files[0]
      if (!f) return
      processImageFile(f, data => {
        avatarImg.src = data
        try { localStorage.setItem('avatarData', data) } catch {}
      })
    })
  }
  document.addEventListener('paste', e => {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile()
        processImageFile(f, data => {
          if (avatarImg) avatarImg.src = data
          try { localStorage.setItem('avatarData', data) } catch {}
        })
        break
      }
    }
  })
}
const openModal = sel => {
  const m = document.querySelector(sel)
  if (!m) return
  m.classList.add('open')
  m.setAttribute('aria-hidden', 'false')
}
const closeModal = m => {
  if (!m) return
  m.classList.remove('open')
  m.setAttribute('aria-hidden', 'true')
}
document.querySelectorAll('[data-modal-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-modal-target')
    openModal(target)
  })
})
document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal')))
})
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', () => closeModal(ov.closest('.modal')))
})
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => closeModal(m))
  }
})
