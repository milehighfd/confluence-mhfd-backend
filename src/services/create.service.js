// Producto: Proyecto
function Proyecto(name, description, creator, creationDate) {
  this.name = name;
  this.description = description;
  this.creator = creator;
  this.creationDate = creationDate;
}

// Creador: Factory de Proyectos
function ProyectoFactory() {}

ProyectoFactory.prototype.crearProyecto = function(tipo, name, description, creator, creationDate) {
  switch (tipo) {
    case 'capital':
      return new ProyectoCapital(name, description, creator, creationDate);
    case 'study':
      return new ProyectoStudy(name, description, creator, creationDate);
    case 'special':
      return new ProyectoSpecial(name, description, creator, creationDate);
    default:
      throw new Error('Tipo de proyecto no válido');
  }
}

// Producto Concreto: Proyecto Capital
function ProyectoCapital(name, description, creator, creationDate) {
  Proyecto.call(this, name, description, creator, creationDate);
  this.capitalAmount = 0;
}

ProyectoCapital.prototype = Object.create(Proyecto.prototype);
ProyectoCapital.prototype.constructor = ProyectoCapital;

ProyectoCapital.prototype.setCapitalAmount = function(amount) {
  this.capitalAmount = amount;
}

ProyectoCapital.prototype.getCapitalAmount = function() {
  return this.capitalAmount;
}

// Producto Concreto: Proyecto Study
function ProyectoStudy(name, description, creator, creationDate) {
  Proyecto.call(this, name, description, creator, creationDate);
  this.studyDuration = 0;
}

ProyectoStudy.prototype = Object.create(Proyecto.prototype);
ProyectoStudy.prototype.constructor = ProyectoStudy;

ProyectoStudy.prototype.setStudyDuration = function(duration) {
  this.studyDuration = duration;
}

ProyectoStudy.prototype.getStudyDuration = function() {
  return this.studyDuration;
}

// Producto Concreto: Proyecto Special
function ProyectoSpecial(name, description, creator, creationDate) {
  Proyecto.call(this, name, description, creator, creationDate);
  this.specialAttribute = '';
}

ProyectoSpecial.prototype = Object.create(Proyecto.prototype);
ProyectoSpecial.prototype.constructor = ProyectoSpecial;

ProyectoSpecial.prototype.setSpecialAttribute = function(attribute) {
  this.specialAttribute = attribute;
}

ProyectoSpecial.prototype.getSpecialAttribute = function() {
  return this.specialAttribute;
}

// Uso del patrón Factory
const proyectoFactory = new ProyectoFactory();

const proyectoCapital = proyectoFactory.crearProyecto('capital', 'Proyecto de Capital', 'John Doe', new Date());
proyectoCapital.setCapitalAmount(1000000);

const proyectoStudy = proyectoFactory.crearProyecto('study', 'Proyecto de Estudio', 'Jane Smith', new Date());
proyectoStudy.setStudyDuration(6);

const proyectoSpecial = proyectoFactory.crearProyecto('special', 'Proyecto Especial', 'Alice Johnson', new Date());
proyectoSpecial.setSpecialAttribute('Especial');

console.log(proyectoCapital);
console.log(proyectoStudy);
console.log(proyectoSpecial);
