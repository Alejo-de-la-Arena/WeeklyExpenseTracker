// Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Eventos
eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupesto);
    formulario.addEventListener('submit', agregarGasto);
}

// Classes
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
        
    }
    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }
    calcularRestante(){
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.inputCantidad, 0);
        this.restante = this.presupuesto - gastado;
        
    }
    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante(); 
        
    }
}


class UI {
    insertarPresupuesto(cantidad){
        //Extrayendo los valores
        const {presupuesto, restante} = cantidad;
        //Agregar al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }
    imprimirAlerta(mensaje, tipo){
        // Crear el div
        const divAlerta = document.createElement('div');
        divAlerta.classList.add('text-center', 'alert');
        if(tipo === 'error'){
            divAlerta.classList.add('alert-danger');
        } else {
            divAlerta.classList.add('alert-success')
        }
        //Agregar el mensaje de error
        divAlerta.textContent = mensaje;
        
        //Insertar en el HTML
        document.querySelector('.primario').insertBefore( divAlerta, formulario );

        setTimeout(()=>{
            divAlerta.remove();
        },3000)
    }
    mostrarGastos(gastos){
        
        // Elimina el HTML previo (los nuevos gastos duplicados debido al appenChild)
        this.limpiarHTML();
        //Iterar sobre los gastos
        gastos.forEach( gasto => {

            const {inputCantidad, inputGasto, id} = gasto;

            //Crear un li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center text-capitalize'
            nuevoGasto.dataset.id = id;
            
            
            //Agregar el HTML del gasto
            nuevoGasto.innerHTML = `${inputGasto} <span class="badge badge-primary badge-pill"> $ ${inputCantidad} </span>`;

            //Boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times'
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);
            //Agregar al HTML
            gastoListado.appendChild(nuevoGasto)

        }) 
    }
    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild)
        }
    }
    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }
    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;

        const restanteDiv = document.querySelector('.restante');
        
        //Comprobar 25%
        if( ( presupuesto / 4 ) > restante ) {
            console.log('gastaste el 75%');
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ( ( presupuesto / 2 ) > restante ) {
            console.log('gastaste el 50%')
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }
        //Si el total es 0 o menor
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }   
}

// Instanciar
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupesto() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ){
        window.location.reload();
    }

    //Asigna el valor del presupuesto a la variable let para poder usarla en la ventana global
    presupuesto = new Presupuesto(presupuestoUsuario);
    
    ui.insertarPresupuesto(presupuesto);
}

// Añade gastos
function agregarGasto(e){
    e.preventDefault();

    //Leer los datos del formulario
    const inputGasto = document.querySelector('#gasto').value;
    const inputCantidad = Number(document.querySelector('#cantidad').value);
    
    //Validar 
    if (inputGasto === '' || inputCantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    } else if (inputCantidad <= 0 || isNaN(inputCantidad)){
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }
    
    //Generar un objeto con el gasto
    const gasto = { inputGasto, inputCantidad, id: Date.now() }
    
    // Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);
    
    ui.imprimirAlerta('Gasto agregado Correctamente');

    // Imprimir los gastos
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos)

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
    // Reinicia el formulario
    formulario.reset(); 
}
function eliminarGasto(id){
    //Elimina del objeto
    presupuesto.eliminarGasto(id)

    //Elimina los gastos del HTML
    const {gastos, restante} = presupuesto
    ui.mostrarGastos(gastos)

    //Reembolsar los gastos una vez eliminado un gasto
    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}