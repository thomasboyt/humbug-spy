var server = "http://localhost:5000";
var mutationObserver;

var findCurrentMessageInfo = function(messageRow) {
  // roll backwards over previous siblings until you reach a header
  var trav = function(el, className) {
    if (el.constructor != Text && el.classList.contains(className))
      return el;
    return trav(el.previousSibling, className);
  }

  var headerRow = trav(messageRow, 'recipient_row');
  var userRow = trav(messageRow, 'include-sender');

  return {
    stream: headerRow.querySelector('.stream_label').innerHTML,
    subject: headerRow.querySelector('.narrows_by_subject').innerHTML,
    sender: userRow.querySelector('.sender_name').innerHTML
  }
}

var mutationListener = function (mutations) {
  var messageRow;

  // Handle message
  if (mutations[0] && mutations[0].previousSibling.classList) {
    for (var i=0; i<mutations[0].addedNodes.length; i++) {
      var classList = mutations[0].addedNodes[i].classList;
      if (classList && classList.contains("message_row"))
        messageRow = mutations[0].addedNodes[i];
    }
  }

  if (!messageRow) {
    return
  }

  var message = findCurrentMessageInfo(messageRow);

  var pTags = messageRow.querySelectorAll(".messagebox .message_content p");
  message.lines = [];

  for (var i=0; i < pTags.length; i++) {
    message.lines.push(pTags[i].innerHTML);
  }

  // message:
  //   sender: "Someone's Name"
  //   stream: "Some Stream"
  //   subject: "Some Subject"
  //   lines:
  //     0: "Hello. <strong>This still has HTML tags, FYI.</strong>"
  //     1: "Another line."

  var req = new XMLHttpRequest();
  req.open('POST', server + '/receiver', true);
  req.onload = function(e) {
    if (this.status == 200)
      console.log("Successfully sent");
    else
      console.log(this);
  }
  req.setRequestHeader("content-type", "application/json");
  req.send(JSON.stringify(message));
}

mutationObserver = new WebKitMutationObserver(mutationListener);

mutationObserver.observe(document.querySelector(".message_table"), {
  childList: true,
  subtree: true,
});
