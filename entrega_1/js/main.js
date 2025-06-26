const Productos = []
const carrito = []
const usuarios = [
  { usuario: "admin", contraseña: "123456" },
  { usuario: "valen", contraseña: "123456" },
  { usuario: "profe", contraseña: "123456" }
]
let bandera = true
let credencial = false

function login(usuario, contraseña, intentos){
  if (usuario == null || contraseña == null){
    alert("No se puede dejar campos vacios")
    credencial = false
    return
  }

  const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.contraseña === contraseña)
  
  if (usuarioEncontrado) {
    alert(`Bienvenido al sistema, ${usuarioEncontrado.usuario}`)
    credencial = true
  } else {
    alert(`Usuario o contraseña incorrectos. Intentos restantes: ${intentos - 1}`)
    credencial = false
  }
}

function crearProducto(nombre, precio) {
  const producto = {
    nombre : nombre,
    precio : precio
  }

  Productos.push(producto)
}

function mostrarProductos() {
  if (Productos.length === 0) {
    alert('No hay productos para mostrar')
    return
  }
  let mensaje = 'Los productos son: \n'

  for (let i = 0; i < Productos.length; i++) {
    mensaje += `\n ${Productos[i].nombre} - $${Productos[i].precio}`
  }
  alert(mensaje)
}

const seleccionarNombres = (array) => {
  const nombresProductos = []

  for (let i = 0; i < array.length; i++) {
    nombresProductos.push(array[i].nombre)
  }
  return nombresProductos
}

function buscarProducto() {
  if (Productos.length === 0) {
    alert('No hay productos disponibles para agregar al carrito')
    return
  }

  let nombre = prompt("Ingrese el nombre del producto a agregar al carrito")
  const Nombres = seleccionarNombres(Productos)

  let index = Nombres.indexOf(nombre)
  if (index === -1) {
    alert('No se encontro el producto')
    return
  }

  let cantidadAgregar = Number(prompt("Ingrese la cantidad de unidades a agregar"))
  if (cantidadAgregar <= 0) {
    alert("La cantidad debe ser mayor a 0")
    return
  }

  const NombresCarrito = seleccionarNombres(carrito)
  let indexCarrito = NombresCarrito.indexOf(nombre)

  if (indexCarrito === -1) {
    let objetosDelCarrito = {
      nombre: Productos[index].nombre,
      precio: Productos[index].precio,
      cantidad: cantidadAgregar
    }
    carrito.push(objetosDelCarrito)
    alert(`Se agregaron ${cantidadAgregar} unidades de ${nombre} al carrito`)
  } else {
    carrito[indexCarrito].cantidad += cantidadAgregar
    alert(`Se agregaron ${cantidadAgregar} unidades más de ${nombre} al carrito`)
  }
}

const mostrarCarrito = () => {
  let mensaje = 'Los productos en el carrito son: \n'
  let total = 0

  if (carrito.length === 0) {
    alert('No hay productos en el carrito')
    return
  }

  for (let i = 0; i < carrito.length; i++) {
    const subtotal = carrito[i].precio * carrito[i].cantidad
    mensaje += `${carrito[i].nombre} x${carrito[i].cantidad} - $${carrito[i].precio} c/u = $${subtotal}\n`
    total += subtotal
  }
  
  mensaje += `\nTotal de la compra: $${total}`
  alert(mensaje)
}

function quitarDelCarrito() {
  if (carrito.length === 0) {
    alert('El carrito está vacío')
    return
  }

  let nombre = prompt("Ingrese el nombre del producto a quitar")
  const NombresCarrito = seleccionarNombres(carrito)
  let indexCarrito = NombresCarrito.indexOf(nombre)

  if (indexCarrito === -1) {
    alert('No se encontro el producto en el carrito')
    return
  }

  alert(`Tienes ${carrito[indexCarrito].cantidad} unidades de ${nombre} en el carrito`)
  let cantidad = Number(prompt("Ingrese la cantidad a quitar"))

  if (cantidad <= 0) {
    alert("La cantidad debe ser mayor a 0")
    return
  }

  if (cantidad >= carrito[indexCarrito].cantidad) {
    carrito.splice(indexCarrito, 1)
    alert('Producto eliminado del carrito')
  } else {
    carrito[indexCarrito].cantidad -= cantidad
    alert(`Se quitaron ${cantidad} unidades del producto`)
  }
}

function finalizarCompra() {
  if (carrito.length === 0) {
    alert('No hay productos en el carrito para finalizar la compra')
    return false
  }
  
  alert('¡Compra finalizada! Se mostrará el resumen de su compra.')
  mostrarCompraEnHTML()
  return true
}

function mostrarCompraEnHTML() {
  document.querySelector('.checkout-container').style.display = 'block'
  
  const cartItemsDiv = document.getElementById('cart-items')
  const cartTotalDiv = document.getElementById('cart-total')
  
  cartItemsDiv.innerHTML = '<h2>🛍️ Productos comprados</h2>'
  let total = 0
  
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad
    const itemDiv = document.createElement('div')
    itemDiv.className = 'cart-item'
    itemDiv.innerHTML = `
      <span>${item.nombre} × ${item.cantidad}</span>
      <span>$${item.precio} c/u</span>
      <span>$${subtotal}</span>
    `
    cartItemsDiv.appendChild(itemDiv)
    total += subtotal
  })
  
  cartTotalDiv.innerHTML = `<div class="cart-total">💰 Total: $${total}</div>`
}

const menuBienvenida = "Bienvenido a la tienda de productos!\n 1- Ver productos \n 2- Agregar productos al listado\n 3- Agregar productos al carrito\n 4- Ver carrito\n 5- Quitar productos del carrito\n 6- Finalizar compra\n 0- Salir"

const ingresarUsuario = "Ingrese su usuario:"
const ingresarContraseña = "Ingrese su contraseña:"

for (let intentos = 3; intentos > 0 && !credencial; intentos--) {
  let usuario = prompt(ingresarUsuario)
  let contraseña = prompt(ingresarContraseña)
  
  login(usuario, contraseña, intentos)
  
  if (!credencial && intentos === 1) {
    alert("Demasiados intentos fallidos. El programa se detendrá.")
    bandera = false
    break
  }
}

if (credencial) {
  while (bandera) {
    let opciones = Number(prompt(menuBienvenida))

    switch (opciones) {
      case 0:
        bandera = false
        break

      case 1:
        mostrarProductos()
        break

      case 2:
        let nombreParcial = prompt("Ingrese el nombre del producto")
        let precioParcial = Number(prompt("Ingrese el precio del producto"))
        crearProducto(nombreParcial, precioParcial)
        break

      case 3:
        buscarProducto()
        break

      case 4:
        mostrarCarrito()
        break

      case 5:
        quitarDelCarrito()
        break

      case 6:
        if (finalizarCompra()) {
          bandera = false
        }
        break

      default:
        break
    }
  }
}
