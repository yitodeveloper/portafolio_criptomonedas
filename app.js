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
        tokenMap.push(object);
    });
    var options = {
        data: tokenMap,
        getValue: "name",
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
    $.each(info,function(k,v){
        if($.inArray(v.symbol, subscribe) !== -1){
            var amount = selfAmount(v.price_clp,v.symbol);
            total += amount;
            var card = $("<div>");
            card.addClass("cardcrypto-"+v.symbol);
            card.addClass("card col-12 col-sm-5 offset-sm-1 col-lg-3 mb-4");
            var cardBody = $("<div>");
            cardBody.addClass('card-body');
            var row = $("<div class='row'></div>");
            row.append('<div class="col-4"><h5 class="card-title">'+v.symbol+' to CLP</h5><p class="card-subtitle">Mi '+v.name+' en Peso Chileno</p></div>');
            row.append('<div class="col-8"><h2>$'+amount.toLocaleString()+'</h2><p title="Equivalente a un Ethereum">Valor CLP: $'+Math.round(v.price_clp).toLocaleString()+' <br> Cambio 24h: '+writeChange24(v.percent_change_24h)+'</p><div class="row"><div class="col-6"><button class="btn btn-danger btn-sm" onclick="deleteCard(\''+v.symbol+'\')">Eliminar</button></div><div class="col-6"><button class="btn btn-primary btn-sm" onclick="editAmount(\''+v.symbol+'\')" >Configurar</button></div></div></div>');
            cardBody.append(row);
            card.append(cardBody);

            $(".resumen").append(card);
        }
    });

    $("#total").html("$"+total.toLocaleString());
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

function selfAmount(value,symbol){
    var amount =  Cookies.get("amount-"+symbol);

    if(amount === undefined){
        amount = 0;
        Cookies.set("amount-"+symbol,0);
    }

    if(amount !== 0){
        return Math.round(amount*value);
    }else{
        return 0;
    }
}