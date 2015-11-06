module.exports = function () {
    var events = {};
    var students = [];
    var studentSubscriptions = [];

    return {
        on: function (eventName, student, callback) {
            var studentNumber = students.indexOf(student);
            if (studentNumber === -1) {
                students.push(student);
                studentNumber = students.length - 1;
                studentSubscriptions.push([]);
            }
            var newReaction = {
                student: studentNumber,
                callback: callback
            };
            studentSubscriptions[studentNumber].push(eventName);
            if (!(eventName in events)) {
                events[eventName] = [];
            }
            events[eventName] = events[eventName].concat(newReaction);
            return newReaction;
        },

        off: function (eventName, student) {
            var studentNumber = students.indexOf(student);
            if (eventName in events && studentNumber !== -1) {
                var deleteEvents = [eventName];
                if (eventName.indexOf('.') === -1) {
                    deleteEvents = deleteEvents.concat(Object.keys(events).filter(function (event) {
                        if (event.indexOf(eventName) === -1 || event === eventName) {
                            return false;
                        }
                        return true;
                    }));
                }
                deleteEvents.forEach(function (event) {
                    var numberSubscription = studentSubscriptions[studentNumber].indexOf(event);
                    studentSubscriptions[studentNumber].splice(numberSubscription, 1);
                });
                for (var event = 0; event < deleteEvents.length; event++) {
                    for (var i = 0; i < events[deleteEvents[event]].length; i++) {
                        if (events[deleteEvents[event]][i].student === studentNumber) {
                            events[deleteEvents[event]].splice(i, 1);
                        }
                    }
                }
            }
        },

        emit: function (eventName) {
            var doIt = eventName;
            var currentEvents = [doIt];
            var indexOfPoint = eventName.lastIndexOf('.');
            while (indexOfPoint !== -1) {
                doIt = doIt.substring(0, indexOfPoint);
                currentEvents = currentEvents.concat(doIt);
                indexOfPoint = doIt.lastIndexOf('.');
            }
            students.forEach(function (student, item) {
                var studentEvents = studentSubscriptions[item];
                if (studentEvents.indexOf(eventName) === -1) {
                    return;
                }
                studentEvents.forEach(function (event) {
                    if (currentEvents.indexOf(event) === -1) {
                        return;
                    }
                    var person;
                    events[event].forEach(function (studentReaction) {
                        if (studentReaction.student === item) {
                            person = studentReaction;
                        }
                    });
                    var keys = Object.keys(person);
                    if (keys.length == 2) {
                        person.callback.call(students[person.student]);
                    } else {
                        person.currentReaction++;
                        if (keys.indexOf('countOfReactions') !== -1 &&
                            person.currentReaction <= person.countOfReactions) {
                            person.callback.call(students[person.student]);
                        }
                        if (keys.indexOf('numberOfReaction') !== -1 &&
                            person.currentReaction === person.numberOfReaction) {
                            person.callback.call(students[person.student]);
                            person.currentReaction = 0;
                        }
                    }
                });
            });
        },

        several: function (eventName, student, callback, n) {
            var newReaction = this.on(eventName, student, callback, n);
            newReaction.countOfReactions = n;
            newReaction.currentReaction = 0;
        },

        through: function (eventName, student, callback, n) {
            var newReaction = this.on(eventName, student, callback, n);
            newReaction.numberOfReaction = n;
            newReaction.currentReaction = 0;
        }
    };
};
