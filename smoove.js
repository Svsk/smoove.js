jQuery.fn.extend({
    smoove: function (options, callback) {
        var filterControllerSelector = "["+options.filterControllerCategoryAttribute+"]";
        var $filterController = $(filterControllerSelector);
        
        var $container = $(this);
        var isFiltering = false;
        options.element = $container;

        $filterController.on("click", function (e) {
            if (isFiltering) {
                e.stopPropagation();
                return false;
            }
            
            isFiltering = true;

            $hits = [];

            if (options.mode === "multifilter") {
                var checkedFilters = $(filterControllerSelector + ":checked");

                if (checkedFilters.length === 0) {
                    checkedFilters = "ALL";
                }

                var $allItems = getAllFilterableItems();
                var $itemsToShow = $([]);

                if (checkedFilters === "ALL") {
                    $itemsToShow = $itemsToShow.add(options.element.find("[" + options.itemCategoryAttribute + "]"));
                } else {
                    for (var i = 0; i < checkedFilters.length; i++) {                    
                        var filterCategory = $(checkedFilters[i]).attr(options.filterControllerCategoryAttribute);
                        var $matchingItems = findMatchingElements(filterCategory);
                        $itemsToShow = $itemsToShow.add($matchingItems);
                    }   
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
                $itemsToShowHidden.css("display", "");

                var animatesFinished = 0;
                $itemsToHide.fadeOut().promise().done(function () { 
                    for (var i = 0; i < clones.length; i++) {
                        var clone = clones[i].clone;
                        var original = clones[i].original;
                        var positions = getElementAbsolutePosition(original);
                        clone.data("original", original);

                        clone.animate({ 
                            top: positions.top,
                            left: positions.left
                        }, { queue: false }).promise().done(function () {
                            $(this).data("original").css("visibility", "visible");
                            $(this).remove();
                            $itemsToShowHidden.animate({"opacity": "1"}, { queue: false });

                            animatesFinished++;
                            if (animatesFinished === clones.length && typeof callback === "function") {
                                isFiltering = false;
                                callback(options);
                            }
                        });
                    }
                }); 
            }
        });

        function getAllFilterableItems() {
            return options.element.find("[" + options.itemCategoryAttribute + "]");
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
                left: position.left,
                height: position.height,
                width: position.width
            });
            
            return $clone;
        }

        function getElementAbsolutePosition(element) {
            var $element = $(element);
            var rects = $element[0].getBoundingClientRect();
            var margin = parseInt($element.css("margin-left").replace("px", ""));
            var boxSizing = $element.css("box-sizing");
            var boxSizingXAdjust = 0;
            var boxSizingYAdjust = 0;

            if (boxSizing !== "border-box") {
                var paddingLeft = parseInt($element.css("padding-left").replace("px", ""));
                var paddingTop = parseInt($element.css("padding-top").replace("px", ""));
                var paddingRight = parseInt($element.css("padding-right").replace("px", ""));
                var paddingBottom = parseInt($element.css("padding-bottom").replace("px", ""));

                var borderLeft = parseInt($element.css("border-left-width").replace("px", ""));
                var borderTop = parseInt($element.css("border-top-width").replace("px", ""));
                var borderRight = parseInt($element.css("border-right-width").replace("px", ""));
                var borderBottom = parseInt($element.css("border-bottom-width").replace("px", ""));

                boxSizingXAdjust -= ((paddingLeft + paddingRight) + (borderLeft + borderRight));
                boxSizingYAdjust -= ((paddingTop + paddingBottom) + (borderTop + borderBottom));
            }

            var positions = {
                top: rects.top + $(window).scrollTop() - margin,
                left: rects.left + $(window).scrollLeft() - margin,
                width: rects.width + boxSizingXAdjust,
                height: rects.height + boxSizingYAdjust
            };

            return positions;
        }
    }
});