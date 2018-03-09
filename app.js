var subscribe = Cookies.getJSON("subscribeCrypto");
var info = {};
var tokenSelected = "";
var tokenMap = [];
var start = 0;

$(document).ready(function(){
    $(".formAdd").submit(function (e) {
        e.preventDefault();
        addCrypto();
    });
    $("#updateAmount").click(function(){
        updateAmount();
    });
    getData();
    setInterval(function(){
        getData();
    },60000);
});

function addCrypto () {
    var c = $("#crypto").val();
    c = c.toUpperCase();
    if(subscribe === undefined || subscribe === null){
        subscribe = [];
    }

    var next = false;
    $.each(info,function (k,v) {
        if(v.symbol == c){
            next = true;
        }
    });
    if(!next){
        var cTemp = searchToken(c);
        if( cTemp === false){
            $(".statusText").html("<span class='text-danger'>¡Moneda "+c+" no encontrada!</span>").fadeIn();
            return;
        }
        c= cTemp;

    }


    if($.inArray(c, subscribe) === -1){
        subscribe.push(c);
        Cookies.set("subscribeCrypto",subscribe);
        drawCards();
        $("#crypto").val("").focus();
    }

}

function searchToken(name){
    name = name.toLowerCase();
    symbol = false;
    $.each(tokenMap,function(k,v){
        if(v.name.toLowerCase() === name){
            symbol = v.symbol;
        }
        if(v.search.toLowerCase() === name.toLowerCase()){
            symbol = v.symbol;
        }
    });
    return symbol;
}
function deleteCard(v){
    $(".statusText").html("Eliminando "+v+" de la lista");
    subscribe.splice($.inArray(v,subscribe),1);
    Cookies.set("subscribeCrypto",subscribe);
    $(".cardcrypto-"+v).remove();
    drawCards();
}

function setTokenMap(){
    start = 1;
    $.each(info,function(k,v){
        var object = {};
        object.id = v.id;
        object.name = v.name;
        object.symbol = v.symbol;
        object.search = v.name + " (" + v.symbol + ")";
        tokenMap.push(object);
    });
    var options = {
        data: tokenMap,
        getValue: "search",
        list: {
            match: {
                enabled: true
            },
            sort: {
                enabled: true
            }
        },
        template: {
            type: "custom",
            method: function(k, v) {
                return  v.name + " (" + v.symbol + ")";
            }
        }
    };
    $("#crypto").easyAutocomplete(options).focus();
}

function getData(){
    $(".statusText").html("Actualizando ...").fadeIn();
    $.ajax({
        url: "https://api.coinmarketcap.com/v1/ticker/?convert=CLP&limit=0",
        type: "GET",
        dataType: "json",
        data: {},
        success: function(data){
            info = data;
            $(".statusText").fadeOut("slow");

            drawCards();
            if(start === 0){
                setTokenMap();
            }
        },
        error:{

        }
    });
}

function drawCards(){
    $(".resumen").html("");
    var total = 0;
    var totalBtc = 0;
    var totalUsd = 0;
    $.each(info,function(k,v){
        if($.inArray(v.symbol, subscribe) !== -1){
            var amount = selfAmount(v.price_clp,v.symbol,true);
            var amountUsd = selfAmount(v.price_usd,v.symbol,true);
            var amountBtc = selfAmount(v.price_btc,v.symbol,false);
            total += amount;
            totalUsd += amountUsd;
            totalBtc += amountBtc;
            var container = $('<div>');
            container.addClass('col-12 col-sm-5 offset-sm-1 col-lg-3 mb-sm-4');
            var card = $('<div>');
            card.addClass("cardcrypto-"+v.symbol);
            card.addClass("card");
            var cardHeader = $("<div>");
            cardHeader.addClass('card-header');
            cardHeader.append(v.name+' a Peso Chileno');
            var cardBody = $("<div>");
            cardBody.addClass('card-body');
            var row = $("<div class='row'></div>");
            row.append('<div class="col-12"><p class="card-subtitle">Mis <strong>'+getAmount(v.symbol)+"</strong> "+v.symbol+' en CLP</p><h1 style="margin-bottom: 0px;line-height: 45px;">$'+amount.toLocaleString()+'</h1><p title="Precio del '+v.name+' en \n CLP: $'+v.price_clp.toLocaleString()+' \n BTC: '+v.price_btc.toLocaleString()+' \n USD: $'+v.price_usd.toLocaleString()+' "><span style="font-size: 14px;line-height: 10px;">Total en BTC : '+amountBtc.toLocaleString()+'<br> Total en USD : '+amountUsd.toLocaleString()+' <br></span> Cambio 24h: '+writeChange24(v.percent_change_24h)+'</p><div class="row"><div class="col-6"><button class="btn btn-danger btn-sm" onclick="deleteCard(\''+v.symbol+'\')">Eliminar</button></div><div class="col-6"><button class="btn btn-primary btn-sm" onclick="editAmount(\''+v.symbol+'\')" >Configurar</button></div></div></div>');
            cardBody.append(row);
            card.append(cardHeader);
            card.append(cardBody);
            container.append(card);

            $(".resumen").append(container);
        }
    });

    $("#total").html("$"+total.toLocaleString());
    $("#totalBTCUSD").html(totalBtc.toLocaleString()+" BTC - $"+totalUsd.toLocaleString()+" USD");
}

function editAmount(symbol){
    tokenSelected = symbol;
    var amount =  Cookies.get("amount-"+symbol);
    $("#inputAmount").val(amount);
    $(".modal-title").html("¿Cuantos "+symbol+" tengo?");
    $('.modal').modal('show');
}

function updateAmount(){
    var amount = $("#inputAmount").val();
    Cookies.set("amount-"+tokenSelected,amount);
    $('.modal').modal('hide');
    drawCards();
}

function writeChange24(num){

    if(num >= 0){
        return "<span class='text-success'>"+num+"%</span>";
    }else{
        return "<span class='text-danger'>"+num+"%</span>";
    }
}

function getAmount(symbol){
    var amount =  Cookies.get("amount-"+symbol);
    if(amount === undefined){
        amount = 0;
        Cookies.set("amount-"+symbol,0);
    }
    return amount;
}

function selfAmount(value,symbol,round){
    var amount =  Cookies.get("amount-"+symbol);

    if(amount === undefined){
        amount = 0;
        Cookies.set("amount-"+symbol,0);
    }

    if(amount !== 0){
        if(round){
            return Math.round(amount*value);

        }else{
            return amount*value;
        }

    }else{
        return 0;
    }
}