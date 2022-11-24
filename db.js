var mongoose = require('mongoose');
var statsd = require('./statsd');
const serviceBindings = require('kube-service-bindings');
const { options } = require('mongoose');


var schema = mongoose.Schema({ value: String });
var Values = mongoose.model('values', schema);

module.exports = {
    connectDB: function () {
        console.log("-----------------------------------------------")
        console.log(" CHECK ENV COOKIE_SECRET")
        console.log(process.env.COOKIE_SECRET)
        console.log(" CHECK ENV DB_NAME")
        console.log(process.env.DB_NAME)
        console.log("-----------------------------------------------")
        if ("MONGODB_ADDON_URI" in process.env) {
            console.log('Connecting using MONGODB_ADDON_URI env: ');
            mongoose.connect(process.env.MONGODB_ADDON_URI, { useNewUrlParser: true });
        } else {
            console.log('Connecting NOT using MONGODB_ADDON_URI env, Service Binding....');
            console.log("check if the deployment has been bound to a mongodb instance through service bindings. If so use that connect info")
            const bindings = serviceBindings.getBinding('MONGODB', 'mongoose');
            mongoose.connect(bindings['url'], { ssl: true, useNewUrlParser: true })
                .then(() => {
                    console.log('Connected to the database !')
                })
                .catch((err) => {
                    console.error(`Error connecting to the database. \n${err}`);
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
