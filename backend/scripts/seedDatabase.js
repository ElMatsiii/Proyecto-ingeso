import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

function generateStock(rarity) {
  const rarityLower = rarity.toLowerCase();
  
  if (rarityLower.includes('secret') || rarityLower.includes('ultra')) {
    return Math.floor(Math.random() * 5) + 1; 
  }
  if (rarityLower.includes('rare') || rarityLower.includes('holo')) {
    return Math.floor(Math.random() * 15) + 5;
  }
  return Math.floor(Math.random() * 30) + 10; 
}

function generatePrice(rarity) {
  const rarityLower = rarity.toLowerCase();
  
  if (rarityLower.includes('secret') || rarityLower.includes('ultra')) {
    return (Math.random() * 50 + 30).toFixed(2);
  }
  if (rarityLower.includes('rare') || rarityLower.includes('holo')) {
    return (Math.random() * 20 + 10).toFixed(2);
  }
  return (Math.random() * 10 + 3).toFixed(2);
}

async function fetchCardsFromAPI() {
  console.log('Obteniendo cartas de la API de TCGdex...');
  
  try {
    
    const response = await fetch('https://api.tcgdex.net/v2/es/cards');
    const cards = await response.json();
    
    console.log(`${cards.length} cartas obtenidas`);
    
    const shuffled = cards.sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, 500);
    
    return sample;
  } catch (error) {
    console.error('Error obteniendo cartas:', error);
    throw error;
  }
}

async function fetchCardDetails(cardId) {
  try {
    const response = await fetch(`https://api.tcgdex.net/v2/es/cards/${cardId}`);
    return await response.json();
  } catch (error) {
    console.warn(`No se pudo obtener detalle de ${cardId}`);
    return null;
  }
}

async function seedDatabase() {
  try {
    console.log('Iniciando población de base de datos...');
    
    const cardsBrief = await fetchCardsFromAPI();
    
    console.log('Insertando cartas en la base de datos...');
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < cardsBrief.length; i += 10) {
      const batch = cardsBrief.slice(i, i + 10);
      
      await Promise.all(
        batch.map(async (cardBrief) => {
          try {
            const card = await fetchCardDetails(cardBrief.id);
            
            if (!card) {
              failed++;
              return;
            }
            
            const imageUrl = card.image ? `${card.image}/high.jpg` : null;
            const types = card.types || [];
            const rarity = card.rarity || 'Common';
            const stock = generateStock(rarity);
            const price = generatePrice(rarity);
            
            await sql`
              INSERT INTO cards (
                id, name, image_url, rarity, types, set_name, set_id,
                hp, stage, description, price, stock
              )
              VALUES (
                ${card.id},
                ${card.name},
                ${imageUrl},
                ${rarity},
                ${types},
                ${card.set?.name || 'Unknown'},
                ${card.set?.id || null},
                ${card.hp || null},
                ${card.stage || null},
                ${card.description || null},
                ${price},
                ${stock}
              )
              ON CONFLICT (id) DO UPDATE SET
                stock = EXCLUDED.stock,
                price = EXCLUDED.price
            `;
            
            if (card.attacks && card.attacks.length > 0) {
              for (const attack of card.attacks) {
                if (attack.name && attack.name.trim().length > 0) {
                  await sql`
                    INSERT INTO card_attacks (card_id, name, damage, effect)
                    VALUES (
                      ${card.id},
                      ${attack.name},
                      ${attack.damage || null},
                      ${attack.effect || null}
                    )
                    ON CONFLICT DO NOTHING
                  `;
                }
              }
            }
            
            inserted++;
            
            if (inserted % 50 === 0) {
              console.log(`${inserted} cartas insertadas...`);
            }
            
          } catch (error) {
            console.error(`Error con carta ${cardBrief.id}:`, error.message);
            failed++;
          }
        })
      );      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n Resumen:');
    console.log(`Cartas insertadas: ${inserted}`);
    console.log(`Cartas fallidas: ${failed}`);
    console.log(`Total procesadas: ${inserted + failed}`);
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(stock) as total_stock,
        AVG(price) as avg_price
      FROM cards
    `;
    
    console.log('\n Estadísticas de la base de datos:');
    console.log(` Total de cartas: ${stats[0].total}`);
    console.log(` Stock total: ${stats[0].total_stock}`);
    console.log(` Precio promedio: $${Number(stats[0].avg_price).toFixed(2)}`);
    
    console.log('\n ¡Base de datos poblada exitosamente!');
    
  } catch (error) {
    console.error('Error poblando base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();