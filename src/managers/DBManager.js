module.exports = class DBManager {
  constructor(Schema) {
    this.Schema = Schema;
  }
  
  async patch(id) {
    let data = await this.Schema.findOne({ id });
    
    if (!data) {
      data = new this.Schema({ id });
      
      data = await data.save();
      
      return data;
    } else {
      return data;
    }
  }
}