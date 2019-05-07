CREATE DATABASE tronstation DEFAULT CHARACTER SET utf8;
USE tronstation;

DROP TABLE IF EXISTS `t_weight_his`;
CREATE TABLE `t_weight_his` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_limit` bigint(20) NOT NULL,
  `total_weight` bigint(20) NOT NULL,
  `create_date` datetime NOT NULL,
  `type` char(1) NOT NULL,  -- 0 is energy, 1 is bandwidth
  `net` char(1) NOT NULL, -- 0 is main net, 1 is test net
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_reward_his`;
CREATE TABLE `t_reward_his` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sr_name` varchar(100) NOT NULL,
  `sr_address` varchar(50) NOT NULL,
  `sr_votes` bigint(20) NOT NULL,
  `sr_votes_reward` bigint(20) NOT NULL,
  `sr_block_reward` bigint(20) DEFAULT NULL,
  `sr_total_reward` bigint(20) NOT NULL,
  `create_date` datetime NOT NULL,
  `net` char(1) NOT NULL, -- 0 is main net, 1 is test net
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_currency_his`;
CREATE TABLE `t_currency_his` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(50) NOT NULL,
  `currency` double(8, 5) NOT NULL,
  `based_symbol` varchar(50) NOT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

