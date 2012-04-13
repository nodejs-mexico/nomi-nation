//Copyright (C) 2011  Ivan Torres -MrPix
function defineModels(mongoose, fn) {
    var Schema = mongoose.Schema,
        Nomination, User;

    /**
     * 
     * Model: User
     * 
    */
    User = new Schema({
        '_id' : String, //fb id
        'name' : String, //user name
        'votes' : Number //number of votes for this user
    });
    
    /**
     * 
     * Model: Nomination
     * 
    */
    Nomination = new Schema({
        'name' : String,
        'owner' : String, //who is the owner of the nomination
        'endDate' : Date, //when this nomination is going to end
        'users' : [User], //users added to this nomination
        'voters':{type:Array, default:[]}, //all the dudes that vote this nomination
        'category' : String,
        'ownerdata' : String,
        'sub_cat' : String,
        'active' : Boolean, //nomination finished
        'erased' : [String] //people erased by facebook id, we wont be able to re-add them
    });
    
    Nomination.virtual('id')
        .get(function() {
      return this._id.toHexString();
    });
    
    Nomination.pre('save', function(next) {
        //we could use this later
        next();
    });
    
    mongoose.model('Nomination', Nomination);

    fn();
}

exports.defineModels = defineModels; 