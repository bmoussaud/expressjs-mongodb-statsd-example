var mongoose = require('mongoose');
var statsd = require('./statsd');
const { options } = require('mongoose');

var csb = require('./config-service-binding');

var schema = mongoose.Schema({ value: String });
var Values = mongoose.model('values', schema);

function bindingsToMongoDbUrl(binding) {
    return ['mongodb', '://', `${binding.username}`, ':', `${binding.password}`, '@', `${binding.host}`, `:${binding.port}`].join('');
}

module.exports = {
    connectDB: function () {
        if (! process.env.MONGODB_ADDON_URI === undefined) {
            console.log('Connecting using MONGODB_ADDON_URI env: ');
            mongoose.connect(process.env.MONGODB_ADDON_URI, { useNewUrlParser: true });
        } else {
            console.log('Connecting Using Service Binding....');
            console.log("check if the deployment has been bound to a mongodb instance through service bindings. If so use that connect info")
            const mongoDbBindings = csb.getBindingConfiguration("mongodb")            
            console.log(mongoDbBindings)
            const uri = bindingsToMongoDbUrl(mongoDbBindings)
            console.log(uri)
            mongoose.connect(uri, { ssl: true, useNewUrlParser: true })
                .then(() => {
                    console.log('Connected to the database !')
                })
                .catch((err) => {
                    console.error(`Error connecting to the database. \n${err}`);
                    process.exit(1);
                })
        }
    },

    updateGauge: function () {
        Values.count(function (err, result) {
            if (!err) {
                statsd.gauge('values', result);
            }
        })
    },

    getVal: function (res) {
        Values.find(function (err, result) {
            if (err) {
                console.log(err);
                res.send('database error');
                return
            }
            var values = {};
            for (var i in result) {
                var val = result[i];
                values[val["_id"]] = val["value"]
            }
            var title = process.env.TITLE || 'TAPTAP NodeJS MongoDB demo'
            res.render('index', { title, values: values });
        });
    },

    sendVal: function (val, res) {
        var request = new Values({ value: val });
        request.save((err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ status: "error", value: "Error, db request failed" }));
                return
            }
            this.updateGauge();
            statsd.increment('creations');
            res.status(201).send(JSON.stringify({ status: "ok", value: result["value"], id: result["_id"] }));
        });
    },

    delVal: function (id) {
        Values.remove({ _id: id }, (err) => {
            if (err) {
                console.log(err);
            }
            this.updateGauge();
            statsd.increment('deletions');
        });
    }
};
