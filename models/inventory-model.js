const pool = require('../database/');

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    'SELECT * FROM public.classification ORDER BY classification_name'
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error('getclassificationsbyid error ' + error);
  }
}
/* ***************************
 *  Get inventory item by id ?
 * ************************** */
async function getInventoryById(invId) {
  try {
    const query = 'SELECT * FROM inventory WHERE inv_id = $1';
    const data = await pool.query(query, [invId]);
    return data.rows[0];
  } catch (error) {
    console.error('getinventorybyid error ' + error);
  }
}

/* ***************************
 *  Add Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1)';
    return await pool.query(sql, [classification_name]);
    return true;
  } catch (error) {
    return error.message;
  }
}
/* ***************************
 *  Check already exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql = 'SELECT * FROM classification WHERE classification_name = $1';
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error checking existing classification:', error);
    throw error;
  }
}

/* ***************************
 *  Add inventory
 * ************************** */
async function addInventory(data) {
  try {
    const sql = `
      INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const values = [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Inventory insert error:', error);
    return null;
  }
}
/* ***************************
 *  Get classification to delete
 * ************************** */
async function getClassificationById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM classification WHERE classification_id = $1',
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error('getClassificationById error', err);
    return null;
  }
}
/* ***************************
 *  Delete classification
 * ************************** */
async function deleteClassificationById(id) {
  try {
    const result = await pool.query(
      'DELETE FROM classification WHERE classification_id = $1',
      [id]
    );
    return result.rowCount > 0;
  } catch (err) {
    console.error('deleteClassificationById error', err);
    return false;
  }
}

async function updateInventory(data) {
  try {
    const sql = `UPDATE inventory 
    SET inv_make = $1, 
        inv_model = $2, 
        inv_description = $3, 
        inv_image = $4, 
        inv_thumbnail = $5, 
        inv_price = $6, 
        inv_year = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10 
    WHERE inv_id = $11 
    RETURNING *;`;

    const values = [
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
      data.inv_id,
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Inventory update error:', error);
    return null;
  }
}

async function deleteInventoryById(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const result = await pool.query(sql, [inv_id]);
    return result.rowCount > 0; // true if deleted
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  checkExistingClassification,
  addInventory,
  getClassificationById,
  deleteClassificationById,
  updateInventory,
  deleteInventoryById,
};
