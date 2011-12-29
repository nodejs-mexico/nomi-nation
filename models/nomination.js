function defineModels(mongoose, fn) {
    var Schema = mongoose.Schema,
        Nomination, User;
      
    /**
     * 
     * Model: Nomination
     * 
    */
    Nomination = new Schema({
        'name' : String,
        'users' : [String],
        'type' : String,
        'sub_type' : String,
        'active' : Boolean,
        'erased' : [String]
    });
    
    Nomination.virtual('id')
        .get(function() {
      return this._id.toHexString();
    });
    
    Nomination.pre('save', function(next) {
        //we could use this later
        next();
    });
    
     /**
     * 
     * Model: User
     * 
    */
    User = new Schema({
        'name' : String,
        'nominations' : [String]
    });
    
    User.virtual('id')
        .get(function() {
      return this._id.toHexString();
    });
    
    User.pre('save', function(next) {
        //we could use this later
        next();
    });
    
    mongoose.model('Nomination', Nomination);
    mongoose.model('User', User);

    fn();
}

exports.defineModels = defineModels; 