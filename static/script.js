$(document).ready(function(){
    var socket = io.connect('http://localhost:5000');
    var username = []; 
    var user_id;
    var checkUser = [];
    var chatting_with;
    var exitSubmit = false;

    socket.on('after connect', function(data){
        // console.log(data);
    });

    $('#user-name-submit').click(function(){
        username = $('#user-name-field').val();
        if(username.length == 0) return false;

        socket.emit('new user', {username: username}); 

        $('.user-name').hide();
        $('.main').show();
    });

    socket.on('active users updated', function(users){
        var list = '';

        users.filter(function(user){
            if(user.username === username)
                return false;
            if(checkUser.includes(user.username))
                return false;
            return true;
        }).map(function(user){
            checkUser.push(user.username);
            // console.log('check user '+checkUser);
            list = list+'<li id="'+user.username+'" class="list-group-item d-flex justify-content-between align-items-center active-user">'+user.username+'</li>';
        })

        $('.online-list > .list-group').append(list)
    });

    $(document).on('click', '.active-user', function(){
        var userid = $(this).attr('id');

        socket.emit('fetch chat', {username: username, userid: userid})

        chatting_with = userid
        // console.log(chatting_with)
        return false;
    });

    socket.on('display chat', function(messages){
        // console.log(messages);
        let $list = $('.msg-list');
        $list.html(``);
        if(messages.length == 0)
            return;
        let list_item_array = messages.map(function(message){
            // console.log(message);
            let $li = $("<li>", {"class": "list-group-item msg-item"});
            if(message['sender'] === username)
                $li.addClass('right');
            else
                $li.addClass('left');
            $li.html(message['message']);
            return $li;
        });
        list_item_array.forEach(function(list_item){
            // console.log(list_item);
            $list.append(list_item);
        });
        // console.log($list);	
    })

    $('#send_message').click(function(){
        let message = $('#chat-box').val();
        if(message.length == 0) return;

        socket.emit('new message', {message: message, from: username, to: chatting_with});

        add_message_to_chat(message, username);

        exitSubmit = true
        console.log('exit submit = '+exitSubmit)
    })
    
    socket.on('incoming message', function(message){
        // console.log('data message'+message)
        console.log('exit socket = '+exitSubmit)
        if(!exitSubmit){
            add_message_to_chat(message['message'], message['from']);

            exitSubmit = false;
        }

        if(exitSubmit){
            exitSubmit = false;
        }
    });

    function add_message_to_chat(message, sender)
    {
        let $list = $('.msg-list');
        let $li = $("<li>", {"class": "list-group-item msg-item"});
        console.log('add message = '+username, chatting_with, sender, message);
        if(sender === username)
            $li.addClass('right');
        else if(sender === chatting_with)
            $li.addClass('left');
        else
            return;
        $li.html(message);
        $list.append($li);
    }
});