jQuery.fn.extend({
    smoove: function (options) {
        var $filterController = $(options.filterControllerSelector);
        var $container = $(this);
      //  $container.css("min-height", $container.height());

        $filterController.on("click", function () {
            $hits = [];

            if (options.mode === "multifilter") {
                var checkedFilters = $(options.filterControllerSelector + ":checked");

                if (checkedFilters.length === 0) {
                    checkedFilters = $(options.filterControllerSelector);
                }

                /* Put items in three categories, "all", "show" and "hide" */
                var $allItems = getAllFilterableItems();
                var $itemsToShow = $([]);
                for (var i = 0; i < checkedFilters.length; i++) {                    
                    var filterCategory = $(checkedFilters[i]).attr(options.filterControllerCategoryAttribute);
                    var $matchingItems = findMatchingElements(filterCategory);
                    $itemsToShow = $itemsToShow.add($matchingItems);
                }                
                var $itemsToHide = $allItems.not($itemsToShow);
                var $itemsToShowShown = $itemsToShow.not(":hidden");
                var $itemsToShowHidden = $itemsToShow.not(":visible");

                /* Perform the animations */
                var clones = [];
                $itemsToShowShown.each(function () {
                    clones.push({
                        original: $(this),
                        clone: createAbsoluteClone($(this))
                    });

                    $(this).css("visibility", "hidden");                    
                });

                $itemsToShowHidden.css("opacity", "0");
                $itemsToShowHidden.css("display", "inline");

                $itemsToHide.fadeOut().promise().done(function () { 
                    for (var i = 0; i < clones.length; i++) {
                        var clone = clones[i].clone;
                        var original = clones[i].original;
                        var positions = getElementAbsolutePosition(original);
                        clone.data("original", original);

                        clone.animate({ 
                            top: positions.top,
                            left: positions.left
                        }).promise().done(function () {
                            $(this).data("original").css("visibility", "visible");
                            $(this).remove();
                            $itemsToShowHidden.animate({"opacity": "1"});
                        });
                    }
                }); 
            }
        });

        function getAllFilterableItems() {
            return $("[" + options.itemCategoryAttribute + "]");
        }


        function findMatchingElements(dataCategory) {
            var allItems = getAllFilterableItems();
            var matchingItems = $([]);

            for (var i = 0; i < allItems.length; i++) {
                var itemCategories = $(allItems[i]).attr(options.itemCategoryAttribute).split(";");

                for (var j = 0; j < itemCategories.length; j++) {
                    if (itemCategories[j] === dataCategory) {
                        matchingItems = $(matchingItems).add($(allItems[i]));
                        break;
                    }
                }
            }

            return matchingItems;
        }

        function createAbsoluteClone(original) {
            var $clone = $(original).clone();
            var position = getElementAbsolutePosition(original);
            $(original).parent().append($clone);
            $clone.css({ 
                position: "absolute",
                top: position.top,
                left: position.left
            });
            
            return $clone;
        }

        function getElementAbsolutePosition(element) {
            var $element = $(element);
            var rects = $element[0].getBoundingClientRect();
            var margin = parseInt($element.css("margin-left").replace("px", ""));
            var positions = {
                top: rects.top + $(window).scrollTop() - margin,
                left: rects.left + $(window).scrollLeft() - margin
            };

            return positions;
        }

       /* function getElementAbsolutePosition(element) {
            var $element = $(element);

            var pos = {};

            var margin = parseInt($element.css("margin").replace("px", ""));

            pos.top = $element.offset().top + $(window).scrollTop() - margin;
            pos.left = $element.offset().left + $(window).scrollLeft() - margin;

            return pos;
        }*/
    }
});