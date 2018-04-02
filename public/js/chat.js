var socket = io();
const $ = jQuery;

function scrollToBottom() {
  var messages = $("#messages");
  var newMessage = messages.children("li:last-child");

  var clientHeight = messages.prop("clientHeight");
  var scrollHeight = messages.prop("scrollHeight");
  var scrollTop = messages.prop("scrollTop");
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on("connect", function() {
  var params = $.deparam(window.location.search);

  socket.emit("join", params, function(err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    }
  });
});

socket.on("updateUserList", function(users) {
  var ol = $("<ol></ol>");
  users.forEach(function(user) {
    ol.append($("<li></li>").text(user));
  });
  $("#users").html(ol);
});

socket.on("newMessage", function(message) {
  var template = $("#message-template").html();
  var formattedTime = moment(message.createdAt).format("h:mm a");
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    time: formattedTime
  });

  $("#messages").append(html);
  scrollToBottom();
});

socket.on("newLocationMessage", function(message) {
  var template = $("#location-message-template").html();
  var formattedTime = moment(message.createdAt).format("h:mm a");
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    time: formattedTime,
    lat: message.latitude,
    long: message.longitude
  });

  $("#messages").append(html);
  scrollToBottom();
});

socket.on("disconnect", function() {
  console.log("Disconnected from server");
});

$("#message-form").on("submit", function(e) {
  e.preventDefault();
  var messageTextBox = $("[name=message]");

  socket.emit(
    "createMessage",
    {
      text: messageTextBox.val()
    },
    function() {
      messageTextBox.val("");
    }
  );
});

var locationButton = $("#send-location");
locationButton.on("click", function() {
  if (!navigator.geolocation) {
    return alert("geolocation not supported by your browser");
  }

  locationButton.attr("disabled", "disabled").text("Sending location...");
  navigator.geolocation.getCurrentPosition(
    function(position) {
      locationButton.removeAttr("disabled").text("Send location");
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      locationButton.removeAttr("disabled").text("Send location");
      alert("Unable to fetch your location");
    }
  );
});
