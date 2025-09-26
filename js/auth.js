// Manejo de autenticación - Registro y Login

// Declare pizzeriaApp variable
const pizzeriaApp = {
  validateEmail: (email) => {
    // Simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  validatePassword: (password) => {
    // Simple password validation (at least 6 characters)
    return password.length >= 6
  },
}

document.addEventListener("DOMContentLoaded", () => {
  initializeAuthForms()
})

function initializeAuthForms() {
  // Formulario de registro
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  // Formulario de login
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }
}

// Manejo del registro
function handleRegister(e) {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const submitBtn = e.target.querySelector('button[type="submit"]')

  // Limpiar errores previos
  clearFieldError("email")

  // Validaciones
  if (!pizzeriaApp.validateEmail(email)) {
    showFieldError("email", "Error email inválido")
    return
  }

  if (!pizzeriaApp.validatePassword(password)) {
    showFieldError("password", "La contraseña debe tener al menos 6 caracteres")
    return
  }

  // Mostrar estado de carga
  showLoading(submitBtn)

  // Simular registro (en una app real, esto sería una llamada a la API)
  setTimeout(() => {
    hideLoading(submitBtn)

    // Simular diferentes escenarios
    const isEmailTaken = email === "test@test.com"

    if (isEmailTaken) {
      showFieldError("email", "Error email inválido")
    } else {
      // Registro exitoso
      showSuccessState()

      // Guardar usuario en localStorage (simulación)
      const userData = {
        email: email,
        registeredAt: new Date().toISOString(),
      }
      localStorage.setItem("registeredUser", JSON.stringify(userData))
    }
  }, 1500)
}

// Manejo del login
function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const submitBtn = e.target.querySelector('button[type="submit"]')

  // Limpiar errores previos
  clearFieldError("loginPassword")

  // Validaciones básicas
  if (!pizzeriaApp.validateEmail(email)) {
    showFieldError("loginEmail", "Email inválido")
    return
  }

  // Mostrar estado de carga
  showLoading(submitBtn)

  // Simular login
  setTimeout(() => {
    hideLoading(submitBtn)

    // Simular validación de credenciales
    const registeredUser = JSON.parse(localStorage.getItem("registeredUser") || "{}")
    const isValidCredentials = email === registeredUser.email && password.length >= 6

    if (!isValidCredentials) {
      showFieldError("loginPassword", "Credenciales incorrectas")
    } else {
      // Login exitoso
      showLoginSuccessState()

      // Guardar sesión
      const sessionData = {
        email: email,
        loginAt: new Date().toISOString(),
      }
      localStorage.setItem("userSession", JSON.stringify(sessionData))
    }
  }, 1500)
}

// Mostrar estado de éxito en registro
function showSuccessState() {
  const form = document.querySelector(".register-form")
  const successState = document.getElementById("successState")

  if (form && successState) {
    form.classList.add("d-none")
    successState.classList.remove("d-none")
    successState.classList.add("fade-in-animation")
  }
}

// Mostrar estado de éxito en login
function showLoginSuccessState() {
  const form = document.querySelector(".login-form")
  const successState = document.getElementById("loginSuccessState")

  if (form && successState) {
    form.classList.add("d-none")
    successState.classList.remove("d-none")
    successState.classList.add("fade-in-animation")

    // Redireccionar después de 2 segundos
    setTimeout(() => {
      window.location.href = "catalogo.html"
    }, 2000)
  }
}

// Funciones de utilidad para errores
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const errorDiv = document.getElementById(fieldId + "Error") || field.nextElementSibling

  field.classList.add("is-invalid")
  if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
    errorDiv.textContent = message
    errorDiv.style.display = "block"
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId)
  const errorDiv = document.getElementById(fieldId + "Error") || field.nextElementSibling

  field.classList.remove("is-invalid")
  if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
    errorDiv.textContent = ""
    errorDiv.style.display = "none"
  }
}

function showLoading(element) {
  const originalText = element.textContent
  element.textContent = "Cargando..."
  element.disabled = true
  element.dataset.originalText = originalText
}

function hideLoading(element) {
  element.textContent = element.dataset.originalText || "Enviar"
  element.disabled = false
}

// Verificar si el usuario está logueado
function isUserLoggedIn() {
  return localStorage.getItem("userSession") !== null
}

// Cerrar sesión
function logout() {
  localStorage.removeItem("userSession")
  window.location.href = "index.html"
}

// Obtener datos del usuario actual
function getCurrentUser() {
  const sessionData = localStorage.getItem("userSession")
  return sessionData ? JSON.parse(sessionData) : null
}
