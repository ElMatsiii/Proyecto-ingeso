export class Card {
  constructor({
    id,
    name,
    image,
    rarity = 'Común',
    types = [],
    set = {},
    hp,
    stage,
    description,
    attacks = [],
    price
  }) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.rarity = rarity;
    this.types = types;
    this.set = set;
    this.hp = hp;
    this.stage = stage;
    this.description = description;
    this.attacks = attacks;
    this.price = price || this.generatePrice();
  }

  generatePrice() {
    return (Math.random() * 20 + 5).toFixed(2);
  }

  getSetName() {
    return this.set?.name || 'Desconocido';
  }

  getTypesString() {
    return this.types.length > 0 ? this.types.join(', ') : 'Sin tipo';
  }

  hasAttacks() {
    return this.attacks && this.attacks.length > 0;
  }

  toCartItem() {
    let imageUrl = this.image;
    
    if (imageUrl) {
      if (!imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.png') && !imageUrl.endsWith('.webp')) {
        imageUrl = `${imageUrl}/high.jpg`;
      }
      
      if (imageUrl.includes('/en/')) {
        imageUrl = imageUrl.replace('/en/', '/es/');
      }
    }
    
    return {
      id: this.id,
      nombre: this.name,
      imagen: imageUrl,
      precio: this.price
    };
  }

  static fromApiResponse(data) {
    return new Card(data);
  }
}