var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
	console.log("Hello World from controller");
	var socket = io().connect();

	$scope.today = new Date();

	var refresh = function() {
		$http.get('/power').success(function(response) {
			$scope.powercommands = response;
		});
	};


	$scope.thismsg = "msg";

	socket.on('new bpEntry', function(msg){		
		//$scope.newmsg = msg;
		console.log($scope.newmsg);
		refresh();
	});

	refresh();

	$scope.addEntry = function() {
		$scope.newdevice.timeStamp = new Date();
		$scope.newdevice.createdOn = new Date();
		$scope.newdevice.id = $scope.newdevice.id.toString();
		$scope.newdevice.pstatus = "OFF";
		$scope.newdevice.powindicator = "";
		$scope.newdevice.bpcategory = "Invalid value";
		$scope.newdevice.bpcatcolor = "darkslategrey";
		$scope.newdevice.diastolic = 0;
		$scope.newdevice.systolic = 0;
		console.log($scope.newdevice);
		$http.post('/power', $scope.newdevice).success(function (response) {
			console.log(response);
			refresh();
		});
		$scope.newdevice = "";
	};


	$scope.remove = function(id) {
		console.log(id);
		$http.delete('/power/' + id).success(function (response) {
			refresh();
		});
	};

	$scope.powerControl = function(id) {
		console.log(id);
		$http.get('/power/' + id).success(function (response) {
			$scope.power = response;
			console.log($scope.power);
			if ($scope.power.pstatus == "ON") {
				$scope.power.pstatus = "OFF";
				$scope.power.powindicator = "";
				
			} else {
				$scope.power.pstatus = "ON";
				$scope.power.powindicator = "btn-success";				
			}
			
			$http.put('/power/' + $scope.power._id, $scope.power).success(function (response) {
				refresh();
			});
		});
	};
}]);

